import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import ProgressBar from 'react-bootstrap/ProgressBar'
import './modal.css'

var fileName = null;
var fileButton = null;
var inputText = null;
var orText = null
var labelText = null;
const deleteIcon = require('./delete.png');
const pdfImage = require('./pdf.png');

class ImageForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.fileSelected = this.fileSelected.bind(this);
        this.onUploadEvent = this.onUploadEvent.bind(this);
        this.revertPreview = this.revertPreview.bind(this);
        this.onStreamBegin = this.onStreamBegin.bind(this);
        this.onStream = this.onStream.bind(this);
        this.onStreamEnd = this.onStreamEnd.bind(this);
        this.state = {imagePreview: false, uploading: false, percent: 0}
        this.props.uploader.on('start', this.onStreamBegin);
        this.props.uploader.on('stream', this.onStream);
        this.props.uploader.on('complete', this.onStreamEnd);
    }

    onStreamBegin(fileInfo) {
        console.log('Start uploading', fileInfo);
        this.setState({uploading: true});
    }

    onStream(fileInfo) {
        console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
        var percent = fileInfo.sent / fileInfo.size * 100;
        console.log(percent);
        this.setState({uploading: true, percent: percent});
    }

    onStreamEnd(fileInfo) {
        console.log('Upload Complete', fileInfo);
        this.setState({uploading: false, imagePreview: false});
        this.props.showForm();
    }

    revertPreview() {
        var preview = document.getElementById("dropZone");
        var form = document.getElementById("myform");
        var inputSubmit = document.getElementById("submit");

        preview.innerHTML = "";
        preview.appendChild(inputText);
        preview.appendChild(orText);
        preview.appendChild(labelText);
        preview.appendChild(fileButton);
        document.getElementById("file").value = null;
        this.setState({imagePreview: false, uploading: false, percent: 0});
    }

    onUploadEvent(e) {
        console.log("fileName is: ");
        console.log(fileName);
        e.preventDefault();
        console.log("upload");
        var id = this.props.uploader.upload(fileName);
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
        // var inputSubmit = document.getElementById("submit");
        var text = document.getElementById("text");
        var or = document.getElementById("or");
        var label = document.getElementById("label");

        // currently we only support 1 file, but can be scalable for multiple in the future
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const img = document.createElement("img");

            //if (!file.type.startsWith('image/')){ continue }
            if (file.type.startsWith('image/')) {
                img.classList.add("obj");
                img.file = file;
                const reader = new FileReader();
                reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
                reader.readAsDataURL(file);
            }
            else if (file.type.startsWith('application/pdf')) {
                console.log("in pdf");
                img.classList.add("obj");
                img.setAttribute('src', pdfImage);
            }

                // when setting thumbnail, want to remove all elements inside dropzone
                if (inputFile != null && text != null && or != null && label != null) {
                    fileButton = inputFile.parentNode.removeChild(inputFile);
                    inputText = text.parentNode.removeChild(text);
                    orText = or.parentNode.removeChild(or);
                    labelText = label.parentNode.removeChild(label);
                }
                preview.innerHTML = "";
                preview.appendChild(img);
                // inputSubmit.style.display = "block";
                this.setState({imagePreview: true});

                // const reader = new FileReader();
                // reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
                // reader.readAsDataURL(file);
        }
    }

    render() {
        return (
            <Modal isOpen={this.props.modal} toggle={this.props.showForm}>
                <ModalBody>
                  <h2> Image Upload </h2>
                  { this.state.imagePreview === true &&
                     <img src={deleteIcon} id="revertButton" class="far fa-times-circle" onClick={this.revertPreview}/>
                  }
                  <form id="myform" name="myform" onSubmit={this.onUploadEvent}>
                      <div id="dropZone" onDrop={this.dropHandler} onDragOver={this.dragOverHandler}>
                        <p id="text"> <center> Drag & drop </center> </p> <p id="or"> <center> or </center> </p>
                        <label id="label" for="file">Click to choose from files</label>
                        <input type="file" id="file" style={{display: "none"}} onChange={this.fileSelected}/>
                      </div>
                      { this.state.imagePreview === true && this.state.uploading === false &&
                          <input type="submit" id="submit" value="Upload" class="button" />
                      }
                      { this.state.uploading === true &&
                          <ProgressBar now={this.state.percent} />
                      }
                  </form>
                </ModalBody>
            </Modal>
        );
    }
}

export default ImageForm
