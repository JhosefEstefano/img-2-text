import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  LoadedImage,
} from 'ngx-image-cropper';
import * as Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  worker!: Tesseract.Worker;
  title = 'img2text';
  ocrResult = 'Recognizing...';
  workerReady = false;
  captureProgress = 0;
  img!: File;
  imgBase64: string = '';
  showLoader: boolean = false;
  textDecod: any;
  constructor(private sanitizer: DomSanitizer, private _service: AppService) {
    this.doOCR();
  }

  async doOCR() {
    this.worker = await createWorker({
      logger: (m) => {
        console.log(m);
        if (m.status == 'recognizing text') {
          this.captureProgress = parseInt('' + m.progress * 100);
        }
      },
    });
    await this.worker.load();
    await this.worker.loadLanguage('spa');
    await this.worker.initialize('spa');
    this.workerReady = true;
  }

  async recognizeIMG() {
    this.imageCropper.crop('blob')?.then(async (res) => {
      console.log(res);
      const imageName = 'name.png';
      const imageFile = new File([res.blob!], imageName, { type: 'image/png' });
      const result = await this.worker.recognize(imageFile);
      console.log(result);
      this.ocrResult = result.data.text;
    });
  }

  selectIMG(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.imgBase64 = reader.result as string;
      };

      reader.readAsDataURL(file);

      this.img = file;
      this.recognizeIMG();
    }
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    // this.selectIMG(event);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl!);
    console.log(event);
    console.log(this.croppedImage);
  }
  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  cargar() {
    // this.showLoader = true;

    // this.imageCropper.crop('blob')?.then((res) => {
    //   const imageName = 'name.png';
    //   // const imageBlob = this.dataURItoBlob();
    //   const imageFile = new File([res.blob!], imageName, { type: 'image/png' });
    //   this._service.post(imageFile).subscribe({
    //     next: (res) => {
    //       console.log(res);
    //       this.textDecod = res;
    //       this.showLoader = false;
    //     },
    //     error: (err) => {
    //       console.error(err);
    //       this.showLoader = false;
    //     },
    //   });
    // });

    this.recognizeIMG();
  }

  dataURItoBlob(dataURI: string) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }
}
