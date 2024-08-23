import { json } from "./json";

const result = json(`{ "a": ["b", "c", { "d": true, "f": 2320.23 }], "g": null, "h": "Hello" }`);
console.log(result);