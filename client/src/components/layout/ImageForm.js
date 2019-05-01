import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import './modal.css'


class ImageForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);
        this.handleFile = this.handleFile.bind(this);
    }

    dropHandler(ev) {
        console.log('File(s) dropped');

      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();

      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
          console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
      }
      const dt = ev.dataTransfer;
      const file = dt.files;
      console.log(file);
      this.handleFile(file);
    }

    dragOverHandler(ev) {
      console.log('File(s) in drop zone');

      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();
    }

    handleFile(files) {
        var preview = document.getElementById("dropZone");
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!file.type.startsWith('image/')){ continue }

            const img = document.createElement("img");
            img.classList.add("obj");
            img.file = file;
            preview.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.

            const reader = new FileReader();
            reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
            reader.readAsDataURL(file);
        }
    }

    render() {
        return (
            <Modal isOpen={this.props.modal} toggle={this.props.showForm}>
                <ModalBody>
                  <h3> Image Upload </h3>
                  <div id="dropZone" onDrop={this.dropHandler} onDragOver={this.dragOverHandler}>
                  <form id="myform" name="myform" onSubmit={this.props.onUploadEvent}>

                  </form>
                  </div>
                 </ModalBody>
                 <ModalFooter>
                     <input type="file" id="file"/>
                     <input type="submit" value="Upload" />
                    <Button color="secondary" onClick={this.props.showForm}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default ImageForm
