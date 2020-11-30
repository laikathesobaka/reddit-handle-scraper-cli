// const inquirer = require("inquirer");
import inquirer from "inquirer";
export async function promptForHandle() {
  const question = {
    name: "handle",
    type: "input",
    message: "Enter reddit handle",
    validate: (value) => {
      if (value.length) {
        return true;
      } else {
        return "Please enter a reddit handle.";
      }
    },
  };
  return await inquirer.prompt([question]);
}
