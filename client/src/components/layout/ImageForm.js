import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import './modal.css'

var fileName = null;
var fileButton = null;
var submitButton = null;
var inputText = null;

class ImageForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.fileSelected = this.fileSelected.bind(this);
        this.onUploadEvent = this.onUploadEvent.bind(this);
        this.revertPreview = this.revertPreview.bind(this);
        this.state = {imagePreview: false}
    }

    revertPreview() {
        var preview = document.getElementById("dropZone");
        var form = document.getElementById("myform");

        preview.innerHTML = "";
        preview.appendChild(inputText);
        preview.appendChild(fileButton);
        form.appendChild(submitButton);
        document.getElementById("file").value = null;
        this.setState({imagePreview: false});
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
        var inputFile = document.getElementById("file");
        var inputSubmit = document.getElementById("submit");
        var text = document.getElementById("text");

        // currently we only support 1 file, but can be scalable for multiple in the future
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!file.type.startsWith('image/')){ continue }

            const img = document.createElement("img");
            img.classList.add("obj");
            img.file = file;

            // when setting thumbnail, want to remove all elements inside dropzone
            if (inputFile != null && inputSubmit != null) {
                fileButton = inputFile.parentNode.removeChild(inputFile);
                submitButton = inputSubmit.parentNode.removeChild(inputSubmit);
                inputText = text.parentNode.removeChild(text);
            }
            preview.innerHTML = "";
            preview.appendChild(img);
            this.setState({imagePreview: true});

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
                  { this.state.imagePreview === true &&
                      <span id="revertButton" onClick={this.revertPreview}><i class="far fa-times-circle"></i></span>
                  }
                  <form id="myform" name="myform" onSubmit={this.onUploadEvent}>
                      <div id="dropZone" onDrop={this.dropHandler} onDragOver={this.dragOverHandler}>
                        <p id="text"> <center> Drag & Drop <br></br> or </center> </p>
                        <input type="file" id="file" style={{color: 'transparent'}} onChange={this.fileSelected}/>
                      </div>
                      <input type="submit" id="submit" value="Upload" />
                  </form>
                </ModalBody>

                <ModalFooter>
                    <Button color="secondary" onClick={this.props.showForm}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default ImageForm
