import requests
import sys
import json
from datetime import datetime

class BasicShiAPITester:
    def __init__(self, base_url="https://young-vibes-store.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.results = {
            "auth_tests": [],
            "product_tests": [],
            "cart_tests": [],
            "order_tests": [],
            "general_tests": []
        }

    def log_result(self, category, test_name, success, response_data=None, error=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - Error: {error}")
        
        self.results[category].append({
            "name": test_name,
            "success": success,
            "response": response_data,
            "error": str(error) if error else None
        })

    def run_test(self, category, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            if success:
                self.log_result(category, name, True, response_data)
            else:
                self.log_result(category, name, False, response_data, 
                              f"Expected {expected_status}, got {response.status_code}")
            
            return success, response_data

        except Exception as e:
            self.log_result(category, name, False, None, str(e))
            return False, {}

    def test_general_endpoints(self):
        """Test general endpoints"""
        print("\n🔍 Testing General Endpoints...")
        
        # Test root endpoint
        self.run_test("general_tests", "API Root", "GET", "/", 200)
        
        # Test categories endpoint
        success, data = self.run_test("general_tests", "Get Categories", "GET", "/categories", 200)
        if success and "categories" in data:
            categories = data["categories"]
            expected_categories = ["perfumes", "auriculares", "zapatillas", "mochilas", "altavoces", "relojes", "ropa", "gorras"]
            if all(cat in categories for cat in expected_categories):
                self.log_result("general_tests", "Categories Content Validation", True, categories)
            else:
                self.log_result("general_tests", "Categories Content Validation", False, categories, "Missing expected categories")

    def test_product_endpoints(self):
        """Test product-related endpoints"""
        print("\n🔍 Testing Product Endpoints...")
        
        # Get all products
        success, products = self.run_test("product_tests", "Get All Products", "GET", "/products", 200)
        product_id = None
        
        if success and products:
            if len(products) >= 16:
                self.log_result("product_tests", "Products Count Validation (>=16)", True, len(products))
            else:
                self.log_result("product_tests", "Products Count Validation (>=16)", False, len(products), f"Expected >=16, got {len(products)}")
            
            product_id = products[0].get("product_id")
            
            # Test category filtering
            categories = ["zapatillas", "auriculares", "perfumes"]
            for category in categories:
                self.run_test("product_tests", f"Filter Products by {category}", "GET", f"/products?category={category}", 200)
        
        # Test individual product
        if product_id:
            self.run_test("product_tests", "Get Individual Product", "GET", f"/products/{product_id}", 200)
            
        # Test non-existent product
        self.run_test("product_tests", "Get Non-existent Product", "GET", "/products/invalid_id", 404)
        
        return product_id

    def create_test_session(self):
        """Create a test session using auth_testing.md approach"""
        print("\n🔍 Creating Test Session...")
        
        # This would normally use the MongoDB commands from auth_testing.md
        # For now, we'll simulate what a valid session would look like
        # In a real test, you'd run the mongosh commands first
        
        # Test the auth endpoints without actual session first
        self.run_test("auth_tests", "Get User Info (No Auth)", "GET", "/auth/me", 401)
        
        # We can't create a real session without running the MongoDB setup
        # So we'll test the auth flow endpoints
        print("⚠️  Note: Full auth testing requires MongoDB session setup from auth_testing.md")
        return False

    def test_cart_endpoints(self):
        """Test cart endpoints (will fail without auth)"""
        print("\n🔍 Testing Cart Endpoints (No Auth)...")
        
        # These should all return 401 without authentication
        self.run_test("cart_tests", "Get Cart (No Auth)", "GET", "/cart", 401)
        self.run_test("cart_tests", "Add to Cart (No Auth)", "POST", "/cart", 401, 
                     {"product_id": "test_id", "quantity": 1})

    def test_order_endpoints(self):
        """Test order endpoints (will fail without auth)"""
        print("\n🔍 Testing Order Endpoints (No Auth)...")
        
        # These should all return 401 without authentication
        self.run_test("order_tests", "Get Orders (No Auth)", "GET", "/orders", 401)
        self.run_test("order_tests", "Create Order (No Auth)", "POST", "/orders", 401,
                     {"items": [], "total": 0})

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🧪 Starting API Tests for Basic Shi")
        print(f"🌐 Testing against: {self.base_url}")
        
        # Test general endpoints
        self.test_general_endpoints()
        
        # Test product endpoints
        product_id = self.test_product_endpoints()
        
        # Test auth endpoints
        self.create_test_session()
        
        # Test cart endpoints (without auth)
        self.test_cart_endpoints()
        
        # Test order endpoints (without auth)
        self.test_order_endpoints()
        
        # Print summary
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run, self.results

def main():
    tester = BasicShiAPITester()
    all_passed, results = tester.run_all_tests()
    
    # Save results to file
    with open("/app/backend_test_results.json", "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": f"{(tester.tests_passed / tester.tests_run) * 100:.1f}%" if tester.tests_run > 0 else "0%",
            "results": results
        }, f, indent=2)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())