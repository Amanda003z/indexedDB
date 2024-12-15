"use strict";

const IDBRequest = indexedDB.open("database", 1);

IDBRequest.addEventListener("upgradeneeded", () => {
	const db = IDBRequest.result;
	db.createObjectStore("users", {
		autoIncrement: true,
	});
	console.log("Database created.");
});

IDBRequest.addEventListener("success", () => {
	console.log("Database opened successfully.");
	readObjects();
});

IDBRequest.addEventListener("error", () => {
	console.log("An error has ocurred.");
});

document.getElementById("add_button").addEventListener("click", () => {
	let name = document.getElementById("add_field");
	console.log(name.length);
	if (name.value.length > 0) {
		if (document.querySelector(".available") != undefined) {
			if (confirm("You have unsaved elements. Continue anyway?")) {
				addObject({ name: name.value });
				name.value = "";
				readObjects();
			}
		} else {
			addObject({ name: name.value });
			name.value = "";
			readObjects();
		}
	}
});

const IDBOpenTransaction = (mode, msg) => {
	const db = IDBRequest.result;
	const IDBtransaction = db.transaction("users", mode);
	const objectStore = IDBtransaction.objectStore("users");
	IDBtransaction.addEventListener("complete", () => {
		console.log(msg);
	});
	return objectStore;
};

const readObjects = () => {
	const IDBData = IDBOpenTransaction("readonly", "Reading database.");
	const cursor = IDBData.openCursor();
	const fragment = document.createDocumentFragment();
	document.querySelector(".users_container").innerHTML = "";
	cursor.addEventListener("success", () => {
		if (cursor.result) {
			let element = createUserHtml(
				cursor.result.key,
				cursor.result.value
			);
			fragment.appendChild(element);
			cursor.result.continue();
		} else document.querySelector(".users_container").appendChild(fragment);
	});
};

const addObject = (obj) => {
	const IDBData = IDBOpenTransaction(
		"readwrite",
		"Object successfully added."
	);
	IDBData.add(obj);
};

const updateObject = (key, obj) => {
	const IDBData = IDBOpenTransaction(
		"readwrite",
		"Object successfully updated."
	);
	IDBData.put(obj, key);
};

const deleteObject = (key) => {
	const IDBData = IDBOpenTransaction(
		"readwrite",
		"Object successfully deleted."
	);
	IDBData.delete(key);
};

const createUserHtml = (id, name) => {
	const userContainer = document.createElement("DIV");
	userContainer.classList.add("user_container");

	const h3 = document.createElement("h3");
	h3.classList.add("user_name");
	h3.textContent = name.name;
	h3.setAttribute("contenteditable", "true");
	h3.setAttribute("spellcheck", "false");

	const optionsContainer = document.createElement("DIV");
	optionsContainer.classList.add("options_container");

	const saveButton = document.createElement("button");
	saveButton.classList.add("save");
	saveButton.classList.add("unavailable");
	saveButton.textContent = "Save";

	const deleteButton = document.createElement("button");
	deleteButton.classList.add("delete");
	deleteButton.textContent = "Delete";

	optionsContainer.appendChild(saveButton);
	optionsContainer.appendChild(deleteButton);

	userContainer.appendChild(h3);
	userContainer.appendChild(optionsContainer);

	h3.addEventListener("keyup", () => {
		saveButton.classList.replace("unavailable", "available");
	});

	saveButton.addEventListener("click", () => {
		if (saveButton.className == "save available") {
			updateObject(id, { name: h3.textContent });
			saveButton.classList.replace("available", "unavailable");
		}
	});

	deleteButton.addEventListener("click", () => {
		deleteObject(id);
		document.querySelector(".users_container").removeChild(userContainer);
	});

	return userContainer;
};
