const fs = require('fs');
const path = require('path');
const base = 'http://localhost:5000';

const buttonTests = [];

// Helper function to add button tests
function addButtonTest(name, page, buttonSelector, expectedText, expectedAttributes = {}) {
  buttonTests.push({
    name,
    page,
    buttonSelector,
    expectedText,
    expectedAttributes
  });
}

// Website buttons
addButtonTest('Home Order Now Link', 'index.html', 'a.order-now-btn', 'Order Now');
addButtonTest('Book Tour Submit Button', 'book_tour.html', 'button[type="submit"]', 'Book Tour');
addButtonTest('Contact Submit Button', 'contact.html', 'button[type="submit"]', 'Send Message');
addButtonTest('Login Submit Button', 'login.html', 'button[type="submit"]', 'Login');
addButtonTest('Register Submit Button', 'register.html', 'button[type="submit"]', 'Register');
addButtonTest('Forgot Password Submit Button', 'forgot.html', 'button[type="submit"]', 'Send Reset Link');
addButtonTest('Reset Password Submit Button', 'reset-password.html', 'button[type="submit"]', 'Reset Password');
addButtonTest('Checkout Confirm Button', 'checkout.html', 'button[type="submit"]', 'Confirm Order');

// Cart buttons
addButtonTest('Cart Login Button', 'cart.html', 'button[onclick*="login.html"]', 'Login');
addButtonTest('Cart Register Button', 'cart.html', 'button[onclick*="register.html"]', 'Register');
addButtonTest('Cart Checkout Button', 'cart.html', 'button[onclick*="checkout()"]', 'Proceed to Checkout');
addButtonTest('Cart Reset Button', 'cart.html', 'button[onclick*="resetCart()"]', 'Reset Cart');

// Tours page buttons
addButtonTest('Tours Login Button', 'tours.html', 'button[onclick*="login.html"]', 'Login');
addButtonTest('Tours Register Button', 'tours.html', 'button[onclick*="register.html"]', 'Register');

// Order Now page buttons
addButtonTest('OrderNow Login Button', 'ordernow.html', 'button[onclick*="login.html"]', 'Login');
addButtonTest('OrderNow Register Button', 'ordernow.html', 'button[onclick*="register.html"]', 'Register');

// Admin buttons
addButtonTest('Admin Login Submit Button', 'admin/login.html', 'button[type="submit"]', 'Login');
addButtonTest('Admin Reply Submit Button', 'admin/reply_message.html', 'button[type="submit"]', 'Send Reply');

// Dashboard buttons
addButtonTest('Dashboard Logout Button', 'admin/dashboard.html', 'button[onclick*="handleLogout()"]', 'Logout');
addButtonTest('Dashboard Refresh Button', 'admin/dashboard.html', 'button[onclick*="refreshDashboard()"]', 'Refresh');
addButtonTest('Dashboard Filter All Button', 'admin/dashboard.html', '#filterAll', 'All');
addButtonTest('Dashboard Filter Order Button', 'admin/dashboard.html', '#filterOrder', 'Order Customers');
addButtonTest('Dashboard Filter Tour Button', 'admin/dashboard.html', '#filterTour', 'Tour Requesters');
addButtonTest('Dashboard Filter Message Button', 'admin/dashboard.html', '#filterMessage', 'Message Senders');

// Dashboard action buttons (these are in template literals in JavaScript)
addButtonTest('Dashboard Mark Complete Button', 'admin/dashboard.html', "data-action='complete'", 'Mark as Completed');
addButtonTest('Dashboard Cancel Button', 'admin/dashboard.html', "data-action='cancel'", 'Cancel');
addButtonTest('Dashboard Delete Tour Button', 'admin/dashboard.html', "data-action='delete'", 'Delete');
addButtonTest('Dashboard Reply Button', 'admin/dashboard.html', "data-action='reply'", 'Reply');

function report(result) {
  console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  if (!result.passed) {
    console.log('   reason:', result.reason);
  }
}

// Helper function to read HTML file
function readHtmlFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Could not read file: ${filePath}`);
  }
}

(async () => {
  console.log('Starting comprehensive button test suite...');

  for (const test of buttonTests) {
    try {
      const filePath = path.join(__dirname, '..', 'frontend', test.page);
      const html = readHtmlFile(filePath);

      // Check if button exists - use a more flexible approach
      let buttonFound = false;
      let textFound = false;

      // Check for button selector patterns
      if (test.buttonSelector.includes('[type="submit"]')) {
        buttonFound = html.includes('type="submit"') && html.includes(test.expectedText);
      } else if (test.buttonSelector.includes('[onclick*="')) {
        const onclickPattern = test.buttonSelector.match(/onclick\*="([^"]*)"/);
        if (onclickPattern) {
          buttonFound = html.includes(onclickPattern[1]) && html.includes(test.expectedText);
        }
      } else if (test.buttonSelector.startsWith('#')) {
        buttonFound = html.includes(`id="${test.buttonSelector.substring(1)}"`) && html.includes(test.expectedText);
      } else if (test.buttonSelector.startsWith('a.')) {
        const className = test.buttonSelector.substring(2);
        buttonFound = html.includes(`<a`) && html.includes(className) && html.includes(test.expectedText);

      } else if (test.buttonSelector.startsWith('.')) {
        buttonFound = html.includes(`class="${test.buttonSelector.substring(1)}"`) && html.includes(test.expectedText);
      } else if (test.buttonSelector.includes('[data-action="')) {
        const actionPattern = test.buttonSelector.match(/data-action="([^"]*)"/);
        if (actionPattern) {
          buttonFound = html.includes(`data-action="${actionPattern[1]}"`) && html.includes(test.expectedText);
        }
      } else if (test.buttonSelector.includes("data-action='")) {
        // Handle single quotes in template literals
        const actionPattern = test.buttonSelector.match(/data-action='([^']*)'/);
        if (actionPattern) {
          buttonFound = html.includes(`data-action='${actionPattern[1]}'`) && html.includes(test.expectedText);
        }
      } else {
        buttonFound = html.includes(test.buttonSelector) && html.includes(test.expectedText);
      }

      if (!buttonFound) {
        throw new Error(`Button selector "${test.buttonSelector}" or text "${test.expectedText}" not found in HTML`);
      }

      // Check for onclick handlers or data attributes
      if (test.expectedAttributes.onclick && !html.includes(test.expectedAttributes.onclick)) {
        throw new Error(`Expected onclick "${test.expectedAttributes.onclick}" not found`);
      }

      if (test.expectedAttributes['data-action'] && !html.includes(`data-action="${test.expectedAttributes['data-action']}"`)) {
        throw new Error(`Expected data-action "${test.expectedAttributes['data-action']}" not found`);
      }

      report({ name: test.name, passed: true });
    } catch (err) {
      report({ name: test.name, passed: false, reason: err.message });
    }
  }

  console.log('Button test suite finished.');
})();
