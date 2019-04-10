import 'babel-polyfill'
import Vue from '../node_modules/vue/dist/vue.esm.js'

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import 'vue-material/dist/theme/default.css'
Vue.use(VueMaterial)

import axios from 'axios'
const apiUrl = 'https://www.googleapis.com/books/v1/volumes?q='

new Vue({
  el: '#app',
  data: () => {
    return {
      bookTitle: '',
      showSnackbar: false,
      scrollIndex: 0,
      fetchedBooks: [],
      totalCount: 0,
      loading: false
    }
  },
  methods: {
    onScroll(arg) {
      if (arg.pageY + window.innerHeight >= document.body.clientHeight) {
        this.moreResults()
      }
    },
    search() {
      if (this.queryApi(this.searchResults) !== false) {
        this.scrollIndex = 0
      }
    },
    moreResults() {
      if (this.scrollIndex < this.totalCount) {
        this.loading = true
        this.queryApi(this.loadMore)
      } else {
        return false
      }
    },
    queryApi(cb) {
      let query = `${apiUrl}${this.bookTitle}&startIndex=${this.scrollIndex}`
      axios(query)
        .then(data => {
          if (data.data.totalItems > 0) {
            this.totalCount = data.data.totalItems
            this.scrollIndex += data.data.items.length
            return cb(data.data)
          } else {
            this.showSnackbar = true
            return false
          }
        })
        .catch(e => {
          console.warn(e)
        })
    },
    searchResults(results) {
      if (results !== false) {
        this.fetchedBooks = []
        this.appendResults(results)
        return true
      } else {
        return false
      }
    },
    loadMore(results) {
      this.appendResults(results)
    },
    appendResults(results) {
      Object.values(results.items).forEach(item => {
        this.fetchedBooks.push({
          id: item.id,
          title: item.volumeInfo.title,
          description: item.volumeInfo.description
            ? item.volumeInfo.description.split(' ')
            : null,
          cover: item.volumeInfo.imageLinks
            ? item.volumeInfo.imageLinks.thumbnail
            : null
        })
      })
    }
  },
  beforeMount() {
    var passiveIfSupported = false
    try {
      window.addEventListener(
        'test',
        null,
        Object.defineProperty({}, 'passive', {
          get: function() {
            passiveIfSupported = { passive: true }
          }
        })
      )
    } catch (err) {}
    window.addEventListener('scroll', this.onScroll, passiveIfSupported)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  }
})
