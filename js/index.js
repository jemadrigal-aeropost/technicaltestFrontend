const urlMethod = "http://localhost:5000/";
var customer = null;
var items = [];
var total = 0;

const getProductList = async (name)=>{
    const response = await fetch(urlMethod + "productSearch/" + name);
    const product = await response.json();
    let fillTable=``;
    product.product_list.forEach((prod) => {
        fillTable += `<tr>
            <td class="centerElement">${prod.product_id}</td>
            <td class="centerElement">${prod.product_name}</td>
            <td class="centerElement">${prod.price}</td>
            <td class="centerElement">${prod.stock_quantity}</td>
        </tr>`
    });
    document.getElementById("productTable").innerHTML = fillTable;
}

const getProduct = async (name)=>{
    const response = await fetch(urlMethod + "productSearch/" + name);
    const product = await response.json();
    return product.product_list[0];
}

const getCustomerById= async (id)=>{
    const response = await fetch(urlMethod + "customer/" + id);
    const data = await response.json();
    if (data != null){
        if (data.status >= 1){
            customer = data.customer;
            document.getElementById("txtCustomerName").value = data.customer.first_name + " " + data.customer.last_name;
        }else{
            alert(customer.customer.error)
        }
    }
}

window.addEventListener("load", function(){
    if(window.location.href.includes('Products')){
        getProductList("%");
    }else{

    }    
});

const orderTable = document.getElementById("orderTable");
orderTable.addEventListener("click", function(e){
    if(e.target.matches(".removeRow")){
        const index = e.target.parentNode.parentNode.rowIndex;
        orderTable.deleteRow(index);
        total -= items[index-1].subtotal;
        items.splice(index-1, 1);
        document.getElementById("total").innerText = total.toFixed(2);
    }
});

function searchProduct(){
    var productName = document.getElementById("txtProductName").value;
    getProductList(productName.trim() === "" ? "%": productName + "%");
}

function searchCustomer(){
    var customer = document.getElementById("txtCustomerId").value;
    if (customer.trim() === ""){
        alert("Invalid customer id")
        return 
    }
    getCustomerById(customer);
}

const addItem = async ()=>{
    var producName = document.getElementById("txtProductN").value;
    var quantity = document.getElementById("txtProductQuantity").value;
    var subtotal = 0;

    if (producName.trim() === "" || quantity.trim() === ""){
        alert("Invalid information")
        return;
    }

    const response = await fetch(urlMethod + "productSearch/" + producName + "%");
    const data = await response.json();
    var product = data.product_list[0];
    
    if (!insertItemValidations(product, quantity)){
        return;
    }

    subtotal += product.price * Number(quantity);
    total += subtotal;

    let fillTable = document.getElementById("itemsTable").innerHTML;
     fillTable += `<tr>
            <td class="centerElement">${product.product_name}</td>
            <td class="centerElement">${product.stock_quantity}</td>
            <td class="centerElement">${product.price}</td>
            <td class="centerElement">${subtotal.toFixed(2)}</td>
            <td class="centerElement"><button type="button" class="btn btn-secondary removeRow">Remove</button></td>
        </tr>`
    ;
    
    itemToList(product.product_id,subtotal.toFixed(2),quantity);

    document.getElementById("itemsTable").innerHTML = fillTable;

    document.getElementById("txtProductN").value = "";
    document.getElementById("txtProductQuantity").value = "";
    document.getElementById("total").innerText = total.toFixed(2);
}

function clearOrder(){
    total = 0;
    customer = null;
    items = [];
    document.getElementById("txtCustomerName").value = "";
    document.getElementById("txtCustomerId").value = "";
    document.getElementById("txtProductN").value = "";
    document.getElementById("txtProductQuantity").value = "";
    document.getElementById("itemsTable").innerHTML = null;

    document.getElementById("total").innerText = total.toFixed(2);
}

function placeOrder(){
    debugger;
    if (!placeOrderValidations()){
        return;
    }

    var order = {
        "customer_id": customer.customer_id,
        "items": items
      }

    fetch(urlMethod + 'createOrder', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
          },
        body: JSON.stringify(order)
	}).then(function (res) {
        clearOrder();
    }).then(function (data) {
        alert("Error saving order");
    });
}

function insertItemValidations(product , quantity){
    if (product == null){
        alert("Invalid product")
        return false;
    }

    if (product.stock_quantity < quantity){
        alert("insufficient stock")
        return false;
    }

    return true;
}

function placeOrderValidations(){
    if (customer == null){
        alert("Invalid customer");
        return false;
    }

    if(total == 0){
        alert("Invalid items");
        return false;
    }
    return true;
}

function itemToList(product_id,subtotal,quantity){
    var i = {
        "product_id": product_id,
        "quantity": quantity,
        "subtotal": subtotal
      }

      items.push(i);
}