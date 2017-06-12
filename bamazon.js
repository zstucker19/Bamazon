var mysql = require("mysql");
var inquirer = require("inquirer");

var con = mysql.createConnection({
	host: "localhost",
	database: "Bamazon",
	post: 3306,
	user: "root",
	password: "root"
});


con.connect(function(err) {
	if(err) {
		//console.log("Connection Error");
		return;
	}
	//console.log("Connection Established");
});


var customerStock = function() {

		inquirer.prompt([
		{
			name: "question",
			message: "What would you like to do?",
			type: "rawlist",
			choices: ["View Products", "Purchase", "Exit"]
		}
		]).then(function(answers) {
			if(answers.question === "View Products") {
				viewStock();
			}

			if(answers.question === "Purchase") {
				purchaseQuery();
			}

			if(answers.question === "Exit") {
				begin();
			}
	});
}


var viewStock = function() {

	con.query("SELECT * FROM products", function(err, rows) {
	if(err) throw err;

	console.log("Stock from Bamazon: \n\n-----------------------\n");

	for(var i = 0; i < rows.length; i++) {
		console.log("ID: " + rows[i].item_id + "  |  Item: " + rows[i].product_name + "  |  Department: " + rows[i].department_name + "  |  Price: " + rows[i].price + "  |  Stock: " + rows[i].stock_quantity);
		}

		console.log("What else would you like to do?")
		customerStock();

	});
}



var purchaseQuery = function() {

	var productArray = [];

	con.query("SELECT * FROM products", function(err, rows) {
		if(err) throw err;

		for(var i = 0; i < rows.length; i++) {

			productArray.push(rows[i].product_name);
		}

	});


	inquirer.prompt([
	{
		name: "purchase",
		message: "Which item would you like to purchase?",
		validate: function(input) {
			if(productArray.includes(input)) {
				return true;
			} else {
				console.log("\nPlease enter a new product");
				console.log("View inventory for selection options (Choose by Product Name)");
				console.log(productArray);
				return false;
			}
		}
	},
	{
		name: "number", 
		message: "How many would you like to purchase?",
		type: "number"
	}
		]).then(function(answers) {

			con.query("SELECT * FROM products WHERE ?", {product_name: answers.purchase}, function(err, rows) {
				if(err) throw err;

				var newQuantity = (parseInt(rows[0].stock_quantity) - parseInt(answers.number));
				var newAnswer = (rows[0].product_name);

				var price = (parseInt(answers.number) * parseInt(rows[0].price));

				var salesRow = rows[0].total_sales;

				//console.log(rows[0].department_name)

				var totalSales = (salesRow += price);


				//console.log(newQuantity);
				//console.log(answers.purchase);

				if(rows[0].stock_quantity < answers.number) {
					console.log("Insufficient Quantity\n");
					customerStock();
				} else {
					con.query(
						"UPDATE products SET stock_quantity = ? WHERE product_name = ?", [newQuantity, newAnswer],
						function(err, result) {
							if(err) throw err;

	
							//console.log("Changed " + result.changedRows + " rows");

						}
					)
					console.log("Total Cost: $" + price);
				}


				con.query(
					"UPDATE products SET total_sales = ? WHERE product_name = ?", [totalSales, newAnswer],
					function(err, result) {
						if(err) throw err;

						//console.log("Total Product Sales: $" + totalSales);
					})

				con.query(
					"SELECT * FROM departments WHERE ?", {department_name: rows[0].department_name}, function(err, rows) {
						//console.log(rows[0].department_name);
						if(err) throw err;

						var departmentAnswer = rows[0].department_name;
						var totalDepartmentSales = (parseInt(rows[0].total_sales) + parseInt(price));

				con.query(
					"UPDATE departments SET total_sales = ? WHERE department_name = ?", [totalDepartmentSales, departmentAnswer],
					function(err, result) {
						if(err) throw err;

						//console.log("Total Department Sales: $ " + totalDepartmentSales);
					})
				})

				customerStock();
			})
		})
}

var begin = function() {

	inquirer.prompt([ 
		{
			name: "begin",
			message: "Who are you logging in as?",
			type: "rawlist",
			choices: ["Customer", "Manager", "Supervisor"]
		}	
	]).then(function(answers) {
		if(answers.begin === "Customer") {
			customerStock();
		}
		if(answers.begin === "Manager") {
			managerStock();
		} 
		if(answers.begin === "Supervisor") {
			supervisorView();
		}
	})
}

begin();





var managerStock = function() {

		inquirer.prompt([
		{
			name: "question",
			message: "What would you like to do?",
			type: "rawlist",
			choices: ["View Products", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
		}
		]).then(function(answers) {
			if(answers.question === "View Products") {
				viewManagerStock();
			}

			if(answers.question === "View Low Inventory") {
				lowInventory();
			}

			if(answers.question === "Add to Inventory") {
				addInventory();
			}

			if(answers.question === "Add New Product") {
				addProduct();
			}

			if(answers.question === "Exit") {
				begin();
			}
	});
}


var viewManagerStock = function() {

	con.query("SELECT * FROM products", function(err, rows) {
		if(err) throw err;

		console.log("Stock from Bamazon: \n\n-----------------------\n");

		for(var i = 0; i < rows.length; i++) {
		console.log("ID: " + rows[i].item_id + "  |  Item: " + rows[i].product_name + "  |  Department: " + rows[i].department_name + "  |  Price: " + rows[i].price + "  |  Stock: " + rows[i].stock_quantity);
		}

			console.log("What else would you like to do?")
			managerStock();

		});
}

var lowInventory = function() {

	con.query("SELECT * FROM products", function(err, rows) {
		if(err) throw err;

		console.log("Low Stock in Bamazon: \n\n-----------------------\n")
		for(var i = 0; i < rows.length; i++) {
			if(rows[i].stock_quantity < 20) {
				console.log("ID: " + rows[i].item_id + "  |  Item: " + rows[i].product_name + "  |  Department: " + rows[i].department_name + "  |  Price: " + rows[i].price + "  |  Stock: " + rows[i].stock_quantity);
			}
		}
	});
	managerStock();
}

var addInventory = function() {

	var productArray = [];

	con.query("SELECT * FROM products", function(err, rows) {
		if(err) throw err;

		for(var i = 0; i < rows.length; i++) {

			productArray.push(rows[i].product_name);
		}

	});


	inquirer.prompt([
	{
		name: "add",
		message: "Which item would you like to add inventory for?",
		validate: function(input) {
			if(productArray.includes(input)) {
				return true;
			} else {
				console.log("\nPlease enter a valid existing product");
				return false;
			}
		}
	},
	{
		name: "number", 
		message: "How many would you like to add to inventory",
		type: "number"
	}
		]).then(function(answers) {
			con.query("SELECT * FROM products WHERE ?", {product_name: answers.add}, function(err, rows) {
				if(err) throw err;

				//console.log(rows);

				var addQuantity = (parseInt(rows[0].stock_quantity) + parseInt(answers.number));
				var addAnswer = (rows[0].product_name);
				var add = (parseInt(answers.number) + parseInt(rows[0].stock_quantity));


					con.query(
						"UPDATE products SET stock_quantity = ? WHERE product_name = ?", [addQuantity, addAnswer],
						function(err, result) {
							if(err) throw err;

	
							//console.log("Changed " + result.changedRows + " rows");

						}
					)
					//console.log("Total Units: " + add + " units");
			})

		managerStock();
	})
}


var addProductCheck = function() {

	inquirer.prompt([
	{
		name: "newCheck",
		message: "Would you like to add a new product?",
		type: "rawlist",
		choices: ["Yes", "No"]
	}
		]).then(function(answers) {
			if(answers.newCheck === "Yes") {
				addProduct();
			}

			if(answers.newCheck === "No") {
				managerStock();
			}
		})
}



var addProduct = function() {

	var productArray = [];

	con.query("SELECT * FROM products", function(err, rows) {
		if(err) throw err;

		for(var i = 0; i < rows.length; i++) {

			productArray.push(rows[i].product_name);
		}

	});

	var departmentArray = [];

	con.query("SELECT * FROM departments", function(err, rows) {
		if(err) throw err;

		for(var i = 0; i < rows.length; i++) {
			departmentArray.push(rows[i].department_name);
		}

	});

	// console.log(departmentArray);

	inquirer.prompt([
	{
		name: "newName",
		message: "What is the name of the new product you would like to enter?",
		validate: function(input) {
			if(!productArray.includes(input) || input.length < 1) {
				return true;
			} else {
				console.log("\nPlease a new product");
				return false;
			}
		}
	},
	{
		name: "department",
		message: "Which department is this product under?",
		validate: function(input) {
			if(departmentArray.includes(input)) {
				return true;
			} else {
				return console.log("\nPlease pick a valid department");
			}
		}
	},
	{
		name: "newPrice",
		message: "What is the price of this new product?",
		type: "number"
	},
	{
		name: "newStock",
		message: "How many would you like to stock?",
		type: "number"
	}
		]).then(function(answers) {
			con.query("INSERT INTO products SET ?", {product_name : answers.newName, department_name : answers.department, price : answers.newPrice, stock_quantity : answers.newStock}, function(err, res) {
			if (err) throw err;
			managerStock();
		});

		})
}

var supervisorView = function() {

	inquirer.prompt([
	{
		name: "question",
		message: "What would you like to do?",
		type: "rawlist",
		choices: ["View Department Sales", "Create New Department", "Exit"]
	}
		]).then(function(answers) {
			if(answers.question === "View Department Sales") {
				viewDepartments();
			}

			if(answers.question === "Create New Department") {
				createDepartment();
			}

			if(answers.question === "Exit") {
				begin();
			}
		})

}


var viewDepartments = function() {

		con.query("SELECT * FROM departments", function(err, rows) {
		if(err) throw err;

		console.log("Departments in Bamazon: \n\n-----------------------\n")
			for(var i = 0; i < rows.length; i++) {
			console.log("ID: " + rows[i].department_id + "  |  Department Name: " + rows[i].department_name + "  |  Overhead: " + rows[i].over_head_costs + "  |  Total Sales: " + rows[i].total_sales + "  |  Profit: " + (parseInt(rows[i].total_sales) - parseInt(rows[i].over_head_costs)));
			}

		});
	supervisorView();
}



var createDepartment = function() {

	var departmentArray = [];

	con.query("SELECT * FROM departments", function(err, rows) {
		if(err) throw err;

		for(var i = 0; i < rows.length; i++) {
			departmentArray.push(rows[i].department_name);
		}

	});

	inquirer.prompt([
	{
		name: "department",
		message: "What is the name of the new department you wish to create?",
		validate: function(input) {
			if(!departmentArray.includes(input)) {
				return true;
			} else {
				return console.log("\nThat department already exists");
			}
		}
	},
	{
		name: "overhead",
		message: "What is the overhead cost?",
		type: "number",
	}
		]).then(function(answers) {

			con.query("INSERT INTO departments SET ?", {department_name : answers.department, over_head_costs : answers.overhead}, function(err, res) {
				if(err) throw err;
			
			});

			supervisorView();

		})

}

