define([], function () {

  class FormFactory {
      meshManager;
      constructor(meshManager) {
          this.meshManager = meshManager
      }
      /**
       * Creating a new form to change the currently selected text
       * @param selected_mesh
       * @returns {{input: HTMLElement, delete_button: HTMLElement, input_button: HTMLElement, parent_input: HTMLElement, parameter_input: HTMLElement, suggestions: HTMLDivElement, input_div: HTMLDivElement}}
       */
      updateTextForm(selected_mesh) {

          let input_div = document.createElement("div");
          input_div.id = 'changes';

          let input = document.createElement("INPUT");
          input.value = selected_mesh.children[0].geometry._opt.text;
          input.placeholder = "text";
          input.setAttribute("type", "text");

          let parent_input = document.createElement("INPUT");
          parent_input.value = selected_mesh.parent.name;
          parent_input.setAttribute("type", "text");
          parent_input.placeholder = "parent element";

          let parameter_input = document.createElement("INPUT");
          parameter_input.value = selected_mesh.listener;
          parameter_input.setAttribute("type", "text");
          parameter_input.placeholder = "parameter ID";

          let input_button = document.createElement("BUTTON");
          input_button.id = "submit";
          input_button.innerHTML = "update";
          let delete_button = document.createElement("BUTTON");
          delete_button.id = "delete";
          delete_button.innerHTML = "delete";
          let cancel_button = document.createElement("BUTTON")
          cancel_button.id = "cancel";
          cancel_button.innerHTML = "x";

          input_div.appendChild(input);
          input_div.appendChild(document.createElement("p"));
          input_div.appendChild(parent_input);
          input_div.appendChild(document.createElement("p"));
          input_div.appendChild(parameter_input);
          input_div.appendChild(document.createElement("p"));
          input_div.appendChild(input_button);
          input_div.appendChild(delete_button);
          input_div.appendChild(cancel_button);
          document.body.appendChild(input_div);

          let suggestions = this.makesuggestions();


          document.body.appendChild(suggestions);


          return {input_div, input, input_button, delete_button, cancel_button, parent_input, parameter_input, suggestions}
      }

      /**
       * form to generate a new text object
       * @returns {{button: HTMLElement, parent_input: HTMLElement, suggestions: HTMLDivElement, listener_input: HTMLElement, create_div: HTMLDivElement, name_input: HTMLElement}}
       */

      createTextForm () {

          let create_div = document.createElement("div");
          create_div.id = 'create';

          let name_input = document.createElement("INPUT");
          name_input.setAttribute("type", "text");
          name_input.placeholder = "name";

          let parent_input = document.createElement("INPUT");
          parent_input.setAttribute("type", "text");
          parent_input.placeholder = "parent element";

          let listener_input = document.createElement("INPUT");
          listener_input.setAttribute("type", "text");
          listener_input.placeholder = "parameter ID";


          let button = document.createElement("BUTTON");
          button.id = "submit";
          button.style.width = "100px";
          button.innerHTML = "create";

          let cancel_button = document.createElement("BUTTON")
          cancel_button.id = "cancel";
          cancel_button.innerHTML = "x";

          let suggestions = this.makesuggestions();


          create_div.appendChild(name_input);
          create_div.appendChild(document.createElement("p"));
          create_div.appendChild(parent_input);
          create_div.appendChild(document.createElement("p"));
          create_div.appendChild(listener_input);
          create_div.appendChild(document.createElement("p"));
          create_div.appendChild(button);
          create_div.appendChild(cancel_button);
          document.body.appendChild(create_div);


          document.body.appendChild(suggestions);

          return {create_div, button, cancel_button, name_input, parent_input, listener_input, suggestions};
      }

      /**
       * loop through all model elements in the scene and create a list with the name of each one
       * @returns {HTMLDivElement}
       */
      makesuggestions() {
          let suggestions = document.createElement("div");
          suggestions.id = 'suggestions';
          let header = document.createElement("h3");
          header.innerHTML = "Available Models:";
          let list = document.createElement("ul");
          list.style.right = "100px";
          list.style.top = "40px";
          list.style.position = "absolute";
          let models = this.meshManager.models;
          let counter = 0;
          for (let i in models) {
              if (counter < 10) {
                  let item = document.createElement('ul');
                  item.appendChild(document.createTextNode(i));
                  list.appendChild(item);
                  counter += 1;
              }
          }
          suggestions.appendChild(header);
          suggestions.appendChild(list);

          return suggestions;

      }
  }

    return FormFactory;
})
