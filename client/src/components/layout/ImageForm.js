import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import './modal.css'

var fileName = null;

class ImageForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.fileSelected = this.fileSelected.bind(this);
        this.onUploadEvent = this.onUploadEvent.bind(this);
    }

    onUploadEvent(e) {
        console.log(fileName);
        e.preventDefault();
        console.log("upload");
        var id = this.props.uploader.upload(fileName);
        this.props.showForm();
    }

    fileSelected(e) {
        var file = e.target.files;
        this.handleFile(file);
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
      this.handleFile(file);
    }

    dragOverHandler(ev) {
      console.log('File(s) in drop zone');

      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();
    }

    handleFile(files) {
        fileName = files;
        var preview = document.getElementById("dropZone");
        //currently we only support 1 file, but can be scalable for multiple in the future
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!file.type.startsWith('image/')){ continue }

            const img = document.createElement("img");
            img.classList.add("obj");
            img.file = file;
            preview.appendChild(img);

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
                  </div>
                 </ModalBody>
                 <ModalFooter>
                 <form id="myform" name="myform" onSubmit={this.onUploadEvent}>
                     <input type="file" id="file" onChange={this.fileSelected}/>
                     <input type="submit" value="Upload" />
                 </form>

                    <Button color="secondary" onClick={this.props.showForm}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default ImageForm
