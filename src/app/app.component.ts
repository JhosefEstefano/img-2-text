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
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('imageCropperNit') imageCropperNit!: ImageCropperComponent;
  @ViewChild('imageCropperNoFac') imageCropperNoFac!: ImageCropperComponent;
  @ViewChild('imageCropperTotal') imageCropperTotal!: ImageCropperComponent;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  worker!: Tesseract.Worker;
  title = 'img2text';
  ocrResult = 'Recognizing...';
  workerReady = false;
  captureProgress = 0;
  imgOriginal!: File;
  imgNit!: File;
  imgNoFac!: File;
  imgTotal!: File;

  ocrNit: string = '';
  ocrNoFac: string = '';
  ocrTotal: string = '';

  imgBase64: string = '';
  showLoader: boolean = false;
  showSteper: boolean = false;
  textDecod: any;

  formNit = this._fb.group({
    nit: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  formNoFactura = this._fb.group({
    noFac: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  formTotal = this._fb.group({
    total: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  constructor(
    private sanitizer: DomSanitizer,
    private _service: AppService,
    private _fb: FormBuilder
  ) {
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
    // this.imageCropper.crop('blob')?.then(async (res) => {
    //   console.log(res);
    //   const imageName = 'name.png';
    //   const imageFile = new File([res.blob!], imageName, { type: 'image/png' });
    //   const result = await this.worker.recognize(imageFile);
    //   console.log(result);
    //   this.ocrResult = result.data.text;
    // });

    this.showLoader = true;

    const resultNit = await this.worker.recognize(this.imgNit);
    const resultNoFac = await this.worker.recognize(this.imgNoFac);
    const resultTotal = await this.worker.recognize(this.imgTotal);

    this.ocrNit = resultNit.data.text;
    this.ocrNoFac = resultNoFac.data.text;
    this.ocrTotal = resultTotal.data.text;

    this.showLoader = false;
  }

  selectIMG(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.imgBase64 = reader.result as string;
      };

      reader.readAsDataURL(file);

      this.imgOriginal = file;
      this.recognizeIMG();
    }
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    const file: File = event.target.files[0];

    if (file) {
      this.showSteper = true;
      this.formNit.patchValue({
        nit: '',
      });
      this.formNoFactura.patchValue({
        noFac: '',
      });
      this.formTotal.patchValue({
        total: '',
      });
    }
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

  cortarNit() {
    this.imageCropperNit.crop('blob')?.then(async (res) => {
      console.log(res);
      const imageName = 'name.png';
      const imageFile = new File([res.blob!], imageName, { type: 'image/png' });
      this.imgNit = imageFile;
      this.formNit.patchValue({
        nit: this.imageCropperNit.crop('base64')?.base64,
      });
      this._service.snackBar('¡Nit marcado!');
    });
  }

  cortarNoFac() {
    this.imageCropperNoFac.crop('blob')?.then(async (res) => {
      console.log(res);
      const imageName = 'name.png';
      const imageFile = new File([res.blob!], imageName, { type: 'image/png' });
      this.imgNoFac = imageFile;
      this.formNoFactura.patchValue({
        noFac: this.imageCropperNoFac.crop('base64')?.base64,
      });
      this._service.snackBar('!No. Fac. marcado!');
    });
  }

  cortarTotal() {
    this.imageCropperTotal.crop('blob')?.then(async (res) => {
      console.log(res);
      const imageName = 'name.png';
      const imageFile = new File([res.blob!], imageName, { type: 'image/png' });
      this.imgTotal = imageFile;
      this.formTotal.patchValue({
        total: this.imageCropperTotal.crop('base64')?.base64,
      });
      this._service.snackBar('Total marcado!');
    });
  }
}
