import { clearDetails, partListManager, carPartListManager, addItemToList, format_date, getActivePart, init_web3, getOwnerHistoryFromEvents, getOwnedItemsFromEvent } from "./utils.js"

window.onload = async function () {
    
    
    var x = await init_web3()
    //Get all the parts that belonged to this factory and then check the ones that still do
    document.getElementById("part-factory-address").innerHTML = window.accounts[0];
    var parts = await getOwnedItemsFromEvent(window.accounts[0], 'TransferPartOwnership')
    console.log(parts)
    for (var i = 0; i < parts.length; i++) {
        var owners = await getOwnerHistoryFromEvents('TransferPartOwnership', parts[i])
        console.log(owners)
        if (owners[owners.length - 1] == window.accounts[0]) {
            addItemToList(parts[i], "part-list", partListManager)
        }
    }
    
    document.getElementById("build-part").addEventListener("click", function () {
        console.log("Create Part")

        console.log(window.accounts[0]);
        // Get required data and create part on blockchain using web3

        var serial = document.getElementById("create-serial-number").value
        var part_type = document.getElementById("create-part-type").value
        var expiry_date= document.getElementById("expiry-date").value
        var product_price= document.getElementById("product-price").value
        var creation_date = format_date()
        console.log("Serial: " + serial + " Date:" + creation_date + "Part Type: " + part_type + "Expiry Date" + expiry_date + "Product Price" + product_price)

        //Create part hash and send information to blockchain
        var part_sha = web3.utils.soliditySha3(window.accounts[0], web3.utils.fromAscii(serial),
        web3.utils.fromAscii(part_type), web3.utils.fromAscii(creation_date),
        web3.utils.fromAscii(expiry_date), web3.utils.fromAscii(product_price), web3.utils.fromAscii(creation_date))

        window.pm.methods.buildPart(serial, part_type, creation_date, expiry_date, product_price,format_date()).send({ from: window.accounts[0], gas: 1000000 }, function (error, result) {
            console.log("Smart Contract Transaction sent")
            console.log(result)
        })

        console.log(part_sha)

        //Add part hash to part-list for querying
        addItemToList(part_sha, "part-list", partListManager)
    })

    document.getElementById("part-change-ownership-btn").addEventListener("click", function () {
        console.log("Change Ownership")
        //Get part data from active item on owned list

        var hash_element = getActivePart("part-list")
        if (hash_element != undefined) {
            var to_address = document.getElementById("part-change-ownership-input").value
            if (to_address != "") {
                window.co.methods.changeOwnership(0, hash_element.textContent, to_address).send({ from: window.accounts[0], gas: 100000 }, function (error, result) {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log("Changed ownership")
                        //Logic to remove item from owned list
                        hash_element.parentElement.removeChild(hash_element)
                        clearDetails(document.getElementById("part-list-details"))
                        window.pm.methods.setSellDate(hash_element.textContent,format_date()).send({ from: window.accounts[0], gas: 100000 }, function (error, result) {
                            if (error) {
                                console.log(error)
                            } else {
                                console.log("Date Stored")
                            }
                        })
                    }
                })
            }

        }
    })
    
}
