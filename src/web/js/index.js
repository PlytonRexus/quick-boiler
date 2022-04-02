import logo from '../../assets/images/if-logo-nobg.png'
import '../css/index.css'

(function () {
  const $ = document.querySelector.bind(document)
  const $All = document.querySelectorAll.bind(document)
  const root = $('#root')

  console.log('Serving on: ' + __webpack_public_path__)

  const localStorageKeys = {
    storyText: 'if_r-story-text',
    statsText: 'if_r-story-stats',
    schemePreference: 'if_r-scheme-preference',
    modePreference: 'if_r-mode-preference',
    viewPreference: 'if_r-view-preference',
    objectStorage: 'if_r-if-object',
    editorPreference: 'if_r-editor-preference',
    outputPreference: 'if_r-output-preference'
  }

  const refs = {
    darkScheme: 'dark',
    lightScheme: 'light'
  }

  /// ////////////////////////////////
  //                               //
  //       HELPER FUNCTIONS        //
  //                               //
  /// ////////////////////////////////

  function fetchFile (addr, site) {
  	return new Promise((resolve, reject) => {
  		fetch(addr)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.blob()
      })
      .then((blob) => {
        resolve(window.URL.createObjectURL(blob))
      })
      .catch((err) => {
      	console.log('Some fetch error occured.')
      	reject(err)
      })
    })
  }

  function lread (key = localStorageKeys.storyText) {
    return localStorage.getItem(key)
  }

  function lwrite (key = localStorageKeys.storyText, value = instructions) {
    return localStorage.setItem(key, value)
  }

  function showAlert (text) {
    const alertArea = $('#alerts-area')
    alertArea.style.display = 'block'
    alertArea.innerHTML = text
  }

  function insertAtCursor (field, value) {
    // For textarea editor
    if (document.selection) {
      field.focus()
      let sel = document.selection.createRange()
      sel.text = value
    } else if (field.selectionStart || field.selectionStart == '0') {
      const startPos = field.selectionStart
      const endPos = field.selectionEnd
      field.value =
        field.value.substring(0, startPos) +
        value +
        field.value.substring(endPos, field.value.length)
      field.selectionStart = startPos + value.length
      field.selectionEnd = startPos + value.length
    } else {
      field.value += value
    }
  }

  function insertTextAtCaret (text) {
    // For editablecontent elements
    let sel, range
    if (window.getSelection) {
      sel = window.getSelection()
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0)
        range.deleteContents()
        range.insertNode(document.createTextNode(text))
      }
    } else if (document.selection && document.selection.createRange) {
      document.selection.createRange().text = text
    }
  }

  function showModal (html, attrs, styles, ...nodes) {
    // todo: implement unclosabillity
    const modal = $('#modal')
    modal.style.display = 'block'

    const content = $('.modal-content')
    content.innerHTML = `<span class="modal-close">&times;</span><br>${
      html ?? ''
    }`

    if (nodes) {
      nodes.forEach((el) => content.appendChild(el))
    }

    Object.keys(styles).forEach((sty) => (content.style[sty] = styles[sty]))

    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = 'none'
      }
    }

    $('.modal-close').onclick = function () {
      modal.style.display = 'none'
    }
  }

  function closeModal (node) {
    if (node) return (node.style.display = 'none')
    $('#modal').style.display = 'none'
  }

  function useMode (mode) {
    // interface modes
    const modePref = localStorageKeys.modePreference

    if (mode === 'compact') {
      $('.topnav').style.height = '0'
      $('.main-div').style.height = '100vh'
      $('#output-div').style.height = '100vh'
      $('#editor-div').style.height = '100vh'

      const aux = $('#auxbtn')
      aux.style.display = 'block'
      aux.onclick = function () {
        useMode('regular')
        aux.onclick = ''
        aux.style.display = 'none'
      }

      lwrite(modePref, 'compact')
    } else if (mode === 'regular') {
      $('.topnav').style.height = '10vh'
      $('.main-div').style.height = '90vh'
      $('#output-div').style.height = '90vh'
      $('#editor-div').style.height = '90vh'

      lwrite(modePref, 'regular')
    }
  }

  function useScheme (type) {
    const editor = $('#if_r-input-area')
    const statsEditor = $('#if_r-stats-editor')
    const top = $('.topnav')
    const tabs = $All('.tab')
    const tBtn = $All('.tab button')
    const tabCon2 = $('#output-div')

    if (type === refs.darkScheme) {
    	// Light mode/dark mode
      editor.style.background = 'rgb(50, 50, 50)'
      editor.style.color = 'white'

      statsEditor.style.background = 'rgb(50, 50, 50)'
      statsEditor.style.color = 'white'

      top.style.background = 'rgb(50, 50, 50)'
      top.style.color = 'black'

      tabs.forEach((el) => (el.style.background = 'rgb(50, 50, 50)'))
      tBtn.forEach((el) => (el.style.color = 'whitesmoke'))

      // tBtnHover.forEach((el) => (el.style.color = 'red'))

      tabCon2.style.background = 'rgb(50, 50, 50)'

      lwrite(localStorageKeys.schemePreference, refs.darkScheme)

      // tBtnHov.style.color = "black";
    } else if (type === refs.lightScheme) {
      editor.style.background = 'whitesmoke'
      editor.style.color = 'rgb(40, 40, 40)'

      statsEditor.style.background = 'whitesmoke'
      statsEditor.style.color = 'rgb(40, 40, 40)'

      top.style.background = 'whitesmoke'
      // top.style.color = "black";

      tabs.forEach((el) => (el.style.background = 'whitesmoke'))
      tBtn.forEach((el) => (el.style.color = 'black'))

      tabCon2.style.background = 'rgba(102, 102, 102, 0)'

      lwrite(localStorageKeys.schemePreference, refs.lightScheme)
    }
  }

  function isLeftClick (event) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
      return false
    } else if ('buttons' in event) {
      return event.buttons === 1
    } else if ('which' in event) {
      return event.which === 1
    } else {
      return event.button === 1 || event.type === 'click'
    }
  }

  function handleSymlink (e) {
    if (e.ctrlKey) {
      const target = e.target.getAttribute('data-target-button')
      if (ifscript.DEBUG) {
        console.log(target)
      }
      if ($(target)) {
        $(target).click()
      }
    }
  }

  /// ////////////////////////////////
  //                               //
  //        CREATE ELEMENT         //
  //                               //
  /// ////////////////////////////////

  /**
   * Creates DOM nodes based on passed parameters.
   *
   * @param {string} name Name of the element
   * @param {object} attrs Attributes passed as an object
   * @param {object} styles CSS styles passed as an object
   * @param {object} listeners Other properties like "onclick"
   * and "innerHTML" of the element
   * @param {array} children Child nodes of the element
   * @returns {Node} element
   */
  function createElement (name, attrs, styles, listeners, children) {
    const ele = document.createElement(name)
    if (attrs) {
      Object.keys(attrs).forEach((attr) => {
        ele.setAttribute(attr, attrs[attr])
      })
    }
    if (styles) {
      Object.keys(styles).forEach((sty) => {
        ele.style[sty] = styles[sty]
      })
    }
    if (children) {
      children.forEach((child) => ele.appendChild(child))
    }
    if (listeners) {
      Object.keys(listeners).forEach((lsnr) => (ele[lsnr] = listeners[lsnr]))
    }
    return ele
  }

  /* Auxilliary Button */
  const auxBtn = createElement(
    'button',
    {
      id: 'auxbtn',
      class: 'navbtn',
      title: 'Show menubar'
    },
    null,
    {
      innerHTML: '&#x2630;'
    }
  )

  /* Modal */
  /// ////////////////////////////////
  //                               //
  //             MODAL             //
  //                               //
  /// ////////////////////////////////
  const modal = createElement(
    'div',
    {
      id: 'modal',
      class: 'modal'
    },
    null,
    null,
    [
      createElement('div', { class: 'modal-content' }, null, {
        innerHTML: '<span class="modal-close">&times;</span>'
      })
    ]
  )

  /// ////////////////////////////////
  //                               //
  //          MAIN - DIVs          //
  //                               //
  /// ////////////////////////////////
  /* Main divs */
  const mainDiv = createElement(
    'div',
    {
      id: 'main'
    },
    null,
    null,
    [div1, div2]
  )

  /// ////////////////////////////////
  //                               //
  //        APPEND TO ROOT         //
  //                               //
  /// ////////////////////////////////
  /* Append to root */
  root.appendChild(modal)
  root.appendChild(auxBtn)
  root.appendChild(mainDiv)

  /// ////////////////////////////////
  //                               //
  //    GETTING READY, FINALLY!    //
  //                               //
  /// ////////////////////////////////
  /* Getting ready... */

  /* Colour scheme preferences */
  function setColourScheme() {
		if (lread(localStorageKeys.schemePreference)) {
	    useScheme(lread(localStorageKeys.schemePreference))
	  } else {
	    useScheme(refs.lightScheme)
	  }
	  /* Menubar preferences */
	  if (lread(localStorageKeys.modePreference)) {
	    useMode(lread(localStorageKeys.modePreference))
	  }
	  /* Read/Write View Preferences */
	  if (lread(localStorageKeys.viewPreference)) {
	    useView(lread(localStorageKeys.viewPreference))
	  }
  }

  // Colour schemes disabled
  // setColourScheme()

  /* Ctrl + S Save implementation */
  window.onkeydown = function (e) {
    if (!down.includes(e.key)) down.push(e.key)
    if (e.ctrlKey && !down.includes(tracking[0]['1'])) down.push('Control')

    if (down.length === 2 && down.includes(tracking[0]['0']) && e.ctrlKey) {
      e.preventDefault()
      // TODO: save whatever needs to be saved
      document.title = 'Saved all edits'
      setTimeout(() => {
        document.title = story_title ?? 'IF'
      }, 1500)
    }
  }

  window.onkeyup = function (e) {
    let idx
    if (e.ctrlKey) {
      idx = down.findIndex((val) => val === 'Control')
    } else {
      idx = down.findIndex((val) => val === e.key)
    }
    down.splice(idx, 1)
  }

  $All('.symlink').forEach((el) => el.addEventListener('click', handleSymlink))
})()
