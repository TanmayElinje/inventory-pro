# inventory/management/commands/seed_data.py

import random
import json
import os
from faker import Faker
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from inventory.models import Supplier, Category, Product, StockMovement, ProductImage
from django.db import transaction
from tqdm import tqdm

class Command(BaseCommand):
    help = 'Seeds the database using a defined icon list and a product JSON file.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting to seed the database...'))

        fake = Faker()

        category_icons = {
            "Smartphones": "https://img.icons8.com/3d-fluency/94/smartphone.png",
            "Laptops": "https://img.icons8.com/3d-fluency/94/laptop.png",
            "Headphones": "https://img.icons8.com/3d-fluency/94/earbud-headphones.png",
            "TVs & Displays": "https://img.icons8.com/3d-fluency/94/monitor--v1.png",
            "Peripherals": "https://img.icons8.com/3d-fluency/94/computer-mouse.png",
            "Watches & Wearables": "https://img.icons8.com/3d-fluency/94/apple-watch.png",
            "Cameras": "https://img.icons8.com/3d-fluency/94/camera.png",
            "Kitchen Appliances": "https://img.icons8.com/3d-fluency/94/toaster.png",
            "Home Goods": "https://img.icons8.com/3d-fluency/94/armchair.png",
            "Outdoor & Sports": "https://img.icons8.com/3d-fluency/94/rucksack.png",
            "Apparel": "https://img.icons8.com/3d-fluency/94/shopping-bag.png",
            "Gaming": "https://img.icons8.com/3d-fluency/94/game-controller.png",
            "Tools": "https://img.icons8.com/3d-fluency/94/hammer.png",
            "Board Games": "https://img.icons8.com/3d-fluency/94/dice.png",
            "PC Components": "https://img.icons8.com/3d-fluency/94/motherboard.png",
            "Books": "https://img.icons8.com/3d-fluency/94/books.png",
            "Smart Home": "https://img.icons8.com/3d-fluency/94/smart-home.png",
            "Networking": "https://img.icons8.com/3d-fluency/94/wifi-router.png",
            "Power & Batteries": "https://img.icons8.com/3d-fluency/94/lightning-bolt.png",
            "Furniture": "https://img.icons8.com/3d-fluency/94/sofa.png",
        }

        json_file_path = os.path.join(os.path.dirname(__file__), 'product_images.json')
        try:
            with open(json_file_path) as f:
                product_image_data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Error: product_images.json not found in commands directory."))
            return
            
        self.stdout.write('Clearing old data...')
        with transaction.atomic():
            ProductImage.objects.all().delete()
            StockMovement.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            Supplier.objects.all().delete()

        users = list(User.objects.all())
        if not users: self.stdout.write(self.style.ERROR('No users found.')); return

        self.stdout.write('Creating suppliers...')
        suppliers = [Supplier(name=fake.company(), contact_info=fake.email()) for _ in range(100)]
        Supplier.objects.bulk_create(suppliers)
        suppliers = list(Supplier.objects.all())
        
        self.stdout.write('Creating categories using your icon list...')
        category_objects = {name: Category.objects.create(name=name, image_url=url) for name, url in category_icons.items()}
        
        self.stdout.write('Creating products from JSON file...')
        products_to_create = []
        
        for cat_name, products_dict in product_image_data.items():
            if cat_name in category_objects: 
                for product_name in products_dict.keys():
                    cost = round(random.uniform(10.0, 2000.0), 2)
                    sale = round(cost * random.uniform(1.3, 2.0), 2)
                    products_to_create.append(Product(
                        name=product_name, sku=fake.unique.ean(length=13),
                        category=category_objects[cat_name], 
                        supplier=random.choice(suppliers),
                        cost_price=cost, sale_price=sale, 
                        reorder_point=random.randint(10, 50), quantity=0
                    ))
        Product.objects.bulk_create(products_to_create)
        
        product_map = {p.name: p for p in Product.objects.all()}

        self.stdout.write('Assigning image galleries to products...')
        images_to_create = []
        for cat_name, products_dict in tqdm(product_image_data.items(), desc="Creating Images"):
            for product_name, image_urls in products_dict.items():
                if product_name in product_map and image_urls:
                    product_obj = product_map[product_name]
                    for url in image_urls:
                        images_to_create.append(ProductImage(product=product_obj, image=url))
        
        ProductImage.objects.bulk_create(images_to_create)
        products = list(Product.objects.all())

        self.stdout.write('Creating stock history...')
        movements_to_create = []
        product_quantities = {p.id: 0 for p in products}
        end_date = timezone.now()
        
        for product in tqdm(products, desc="Generating History"):
            start_date = end_date - timedelta(days=365)
            initial_stock = random.randint(200, 1000)
            product_quantities[product.id] += initial_stock
            movements_to_create.append(StockMovement(
                product=product, quantity_change=initial_stock, reason='Initial stock',
                user=random.choice(users),
                timestamp=fake.date_time_between(start_date=start_date, end_date=start_date + timedelta(days=30), tzinfo=timezone.get_current_timezone())
            ))

            num_sales = random.randint(5, 15)
            for _ in range(num_sales):
                sale_date = fake.date_time_between(start_date=start_date, end_date=end_date, tzinfo=timezone.get_current_timezone())
                sale_quantity = -random.randint(1, 15)
                
                if product_quantities[product.id] + sale_quantity >= 0:
                    product_quantities[product.id] += sale_quantity
                    movements_to_create.append(StockMovement(
                        product=product, quantity_change=sale_quantity, reason='Customer sale',
                        user=random.choice(users),
                        timestamp=sale_date
                    ))
        
        StockMovement.objects.bulk_create(movements_to_create)

        self.stdout.write('Updating final product quantities...')
        for p in products:
            p.quantity = product_quantities[p.id]
        
        Product.objects.bulk_update(products, ['quantity'])

        self.stdout.write(self.style.SUCCESS('Database successfully seeded from all data sources!'))
