import { createDateFormat } from "../client/js/app.js"
import {expect, jest} from "@jest/globals";
jest.mock("../createDateFormat");
test('Testing the functionality', () => {
    document.body.innerHTML = `
        <div class="input">` +
    `    <div class="city">` +
    `        <input type="text" id="city" placeholder="enter city here">` +
    `    </div>` +
    `    <div class="startdate">` +
    `        <input type="date" class="date" id="startdate" placeholder="Enter start date here">` +
    `    </div>` +
    `    <div class="startdate">` +
    `        <input type="date" class="date" id="enddate" placeholder="Enter end date here">` +
    `    </div>` +
    `    <button id="generate" type="submit"> Generate</button>` +
    `</div>
    `;
    //const button = document.querySelector("#generate");
    //button.click();
    require("../client/js/app.js");
    //expect(removeQuotations("\"I Wanna Graduate\"")).toEqual("I Wanna Graduate");
    //expect(removeQuotations("\"I Wanna Graduate\"")).toBeInstanceOf(Function);
    expect(createDateFormat(new Date())).toHaveLength(10);
});
