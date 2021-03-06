const Mask = {
  apply(input, func) {
    setTimeout(function () {
      input.value = Mask[func](input.value)
    }, 1)
  },
  formatBRL(value) {
    value = value.replace(/\D/g, "")

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  },
  cpfCnpj(value) {
    value = value.replace(/\D/g, "")

    if (value.length > 14) {
      value = value.slice(0, -1)
    }

    //check if it is cpf or cnpj
    //cnpj 11.222.333/0004-56
    if (value.length > 11) {
      //11.222333000456
      value = value.replace(/(\d{2})(\d)/, "$1.$2")
      //11.222.333000456
      value = value.replace(/(\d{3})(\d)/, "$1.$2")
      //11.222.333000456
      value = value.replace(/(\d{3})(\d)/, "$1/$2")
      //11.222.333/0004-56
      value = value.replace(/(\d{4})(\d)/, "$1-$2")

      //cpf 111.222.333-45
    } else {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d)/, "$1.$2.$3-$4")

    }

    return value
  },
  cep(value) {
    value = value.replace(/\D/g, "")

    if (value.length > 8) value = value.slice(0, -1)

    value = value.replace(/(\d{5})(\d)/, "$1-$2")

    return value
  }
}

const ButtonPreventDefault = {
  apply(event, func) {
    ButtonPreventDefault[func](event)
  },
  delete(event) {

    const confirmation = confirm("Você realmente deseja realizar essa exclusão?")
    if (!confirmation) {
      event.preventDefault()
    }
  }
}

const ImagesUpload = {
  input: "",
  preview: document.querySelector('#images-preview'),
  uploadLimit: 6,
  files: [],

  handleFileInput(event) {
    const {
      files: fileList
    } = event.target;

    ImagesUpload.input = event.target

    if (ImagesUpload.hasLimit(event)) return

    Array.from(fileList).forEach(file => {

      ImagesUpload.files.push(file)

      const reader = new FileReader()

      reader.onload = () => {
        const image = new Image()
        image.src = String(reader.result)

        const div = ImagesUpload.getContainer(image)

        ImagesUpload.preview.appendChild(div)

      }

      reader.readAsDataURL(file)
    })

    ImagesUpload.input.files = ImagesUpload.getAllFiles()
  },
  hasLimit(event) {
    const {
      uploadLimit,
      input,
      preview
    } = ImagesUpload;
    const {
      files: fileList
    } = input

    if (fileList.length > uploadLimit) {
      alert(`Envie no máximo ${uploadLimit} imagens`)
      event.preventDefault();
      return true
    }

    const imagesDiv = [];

    preview.childNodes.forEach(item => {
      if (item.classList && item.classList.value == 'image') {
        imagesDiv.push(item)
      }
    })

    const totalImages = fileList.length + imagesDiv.length
    if (totalImages > uploadLimit) {
      alert("Você está ultrapassando o limite de imagens!")
      event.preventDefault();
      return true
    }

    return false
  },
  getAllFiles() {
    const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer()

    ImagesUpload.files.forEach(file => dataTransfer.items.add(file))

    return dataTransfer.files
  },
  getContainer(image) {
    const div = document.createElement('div')

    div.classList.add('image')

    div.onclick = ImagesUpload.removeImage

    div.appendChild(image)
    div.appendChild(ImagesUpload.getRemoveButton())

    return div
  },
  getRemoveButton() {
    const button = document.createElement('i');
    button.classList.add('material-icons');
    button.innerHTML = 'close';
    return button
  },
  removeImage(event) {
    const imageDiv = event.target.parentNode // <div class='image'>
    const imagesArray = Array.from(ImagesUpload.preview.children)
    const index = imagesArray.indexOf(imageDiv)

    ImagesUpload.files.splice(index, 1)
    ImagesUpload.input.files = ImagesUpload.getAllFiles()

    imageDiv.remove();
  },
  removeOldImage(event) {
    const imageDiv = event.target.parentNode

    if (imageDiv.id) {
      const removedFiles = document.querySelector('input[name="removed_files"]')
      if (removedFiles) {
        removedFiles.value += `${imageDiv.id}, `

      }
    }

    imageDiv.remove()
  }
}

const ImageGallery = {
  highlight: document.querySelector('.gallery .highlight > img'),
  previews: document.querySelectorAll('.gallery-preview img'),

  setImage(event) {
    const {
      target
    } = event;

    ImageGallery.previews.forEach(preview => preview.classList.remove('active'))
    target.classList.add('active')

    ImageGallery.highlight.src = target.src
    Lightbox.image.src = target.src
  }
}

const Lightbox = {
  target: document.querySelector('.lightbox-target'),
  image: document.querySelector('.lightbox-target img'),
  closeButton: document.querySelector('.lightbox-target a.lightbox-close'),
  open() {
    Lightbox.target.style.opacity = 1
    Lightbox.target.style.top = 0
    Lightbox.target.style.bottom = 0
    Lightbox.closeButton.style.top = 0
  },
  close() {
    Lightbox.target.style.opacity = 0
    Lightbox.target.style.top = "-100%"
    Lightbox.target.style.bottom = 'initial'
    Lightbox.closeButton.style.top = "-80px"
  }
}

const Validate = {
  apply(input, func) {

    Validate.clearErrors(input)

    let results = Validate[func](input.value)
    input.value = results.value

    if (results.error)
      Validate.displayError(input, results.error)
  },
  displayError(input, error) {
    const div = document.createElement('div')
    div.classList.add('error')
    div.innerHTML = error
    input.parentNode.appendChild(div)
    input.focus
  },
  clearErrors(input) {
    const errorDiv = input.parentNode.querySelector('.error')
    if (errorDiv)
      errorDiv.remove()
  },
  isEmail(value) {
    let error = null
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    if (!value.match(emailFormat))
      error = 'Email inválido'

    return {
      error,
      value
    }
  },
  isCpfCnpj(value) {
    let error = null

    const cleanValues = value.replace(/\D/g, "")

    if (cleanValues.length > 12 && cleanValues.length !== 14) {
      error = 'CNPJ incorreto'
    } else if (cleanValues.length < 12 && cleanValues.length !== 11) {
      error = 'CPF incorreto'
    }
    return {
      error,
      value
    }
  },
  isCep(value) {
    let error = null

    const cleanValues = value.replace(/\D/g, "")

    if (cleanValues.length !== 8) {
      error = 'CEP incorreto'
    }

    return {
      error,
      value
    }
  },
  allFields(e) {
    const items = document.querySelectorAll('.item input, .item select, .item textarea')

    for (item of items) {
      if(item.value == ""){
        const message = document.createElement('div')
        message.classList.add('messages')
        message.classList.add('error')
        message.style.position = 'fixed'
        message.innerHTML = 'Todos os campos são obrigatórios.'

        document.querySelector('body').append(message)

        e.preventDefault()
      }
    }
  }

}

const Cep = {
  pesquisaCep(value) {
    //Nova constiável "cep" somente com dígitos.
    const cep = value.replace(/\D/g, '');

    //Verifica se campo cep possui valor informado.
    if (cep != "") {

      //Expressão regular para validar o CEP.
      const validacep = /^[0-9]{8}$/;

      //Valida o formato do CEP.
      if (validacep.test(cep)) {

        //Preenche os campos com "..." enquanto consulta webservice.
        document.getElementById('street').value = "...";
        document.getElementById('neighborhood').value = "...";
        document.getElementById('city').value = "...";
        document.getElementById('state').value = "...";

        //Cria um elemento javascript.
        const script = document.createElement('script');

        //Sincroniza com o callback.
        script.src = 'https://viacep.com.br/ws/' + cep + '/json/?callback=Cep.meu_callback';

        //Insere script no documento e carrega o conteúdo.
        document.body.appendChild(script);

      } //end if.
      else {
        //cep é inválido.
        Cep.limpa_formulário_cep();
        alert("Formato de CEP inválido.");
      }
    } //end if.
    else {
      //cep sem valor, limpa formulário.
      Cep.limpa_formulário_cep();
    }
  },
  limpa_formulário_cep() {
    //Limpa valores do formulário de cep.
    document.getElementById('street').value = ("");
    document.getElementById('neighborhood').value = ("");
    document.getElementById('city').value = ("");
    document.getElementById('state').value = ("");
    document.getElementById('street_number').value = ("");
  },
  meu_callback(result) {
    if (!("erro" in result)) {
      //Atualiza os campos com os valores.
      document.getElementById('street').value=(result.logradouro);
      document.getElementById('neighborhood').value=(result.bairro);
      document.getElementById('city').value=(result.localidade);
      document.getElementById('state').value=(result.uf);
  } //end if.
  else {
      //CEP não Encontrado.
      Cep.limpa_formulário_cep();
      alert("CEP não encontrado.");
  }
  }
  
}