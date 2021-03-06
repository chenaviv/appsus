
import EmailService from '../service/EmailService.js'
import emailPreview from '../cmps/emailPreview.js'
import emailView from '../cmps/emailView.js'
import emailCompose from '../cmps/emailCompose.js'
// import EmailUpdate from '../cmps/EmailUpdate.js'

export default {
    template: `
        <section class="email-app">

        <email-compose v-if="compose" @sent="handleSent"></email-compose>

        <nav v-else-if="!emailSelected" class="panel">
            <div class="panel-block">
            <button @click="compose = true" class="not-btn compose">
                <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
            </button>
            <p class="control has-icons-left">
                <input v-model="searchTerm" class="input is-small" type="text" placeholder="search">
                <span class="icon is-small is-left">
                <i class="fa fa-search"></i>
                </span>
            </p>
            </div>
            <div class="panel-tabs-container">
                <p class="panel-tabs left-side">
                    <a :class="{'is-active': filter === null}" @click="filter = null">all</a>
                    <a :class="{'is-active': filter}" @click="filter = true">read</a>
                    <a :class="{'is-active': filter === false}" @click="filter = false">unread</a>
                </p>
                <p class="panel-tabs right-side">
                    <a :class="{'is-active': sorted.by === 'date'}" @click="sort('date')">
                        by date
                        <i class="fa fa-sort" aria-hidden="true"></i>
                    </a>
                    <a :class="{'is-active': sorted.by === 'subject'}" @click="sort('subject')">
                        by subject
                        <i class="fa fa-sort" aria-hidden="true"></i>
                    </a>
                </p>
            </div>
            <email-preview v-for="email in emailsToDisplay" :key="email.id" @markRead="markRead" @selected="selectEmail" :email="email"></email-preview>
        </nav>

      <email-view v-else :email="emailSelected" @onClose="emailSelected = null"></email-view>
<!-- 
            <div>
                <button @click="addMode = true" class="not-btn fa cust-btn" title="New email">
                    <i class="fa fa-plus"></i>
                </button>
                <button class="not-btn fa cust-btn" @click="sortEmails('priority')" title="Sort by priority">
                <i class="fa fa-sort-amount-desc" aria-hidden="true" ></i>
                </button>
                <button class="not-btn fa cust-btn" @click="sortEmails('created')" title="Sort by date">
                    <i class="fa fa-sort-numeric-asc" aria-hidden="true"></i>
                </button>
            </div>
            
                <div class="is-flex-between">
                    <email-view v-for="email in emails" :key="email.id" :curr-email="email"></email-view>
                </div>
                    <email-update v-if="addMode" :email="newEmail" @update="addEmail"></email-update>                
             -->
            
        </section>
    `,
    data() {
        return {
            emails: [],
            newEmail: EmailService.emptyEmail(),
            addMode: false,
            emailSelected: null,
            filter: null,
            sorted: {by: 'date', firstToLast: true},
            searchTerm: '',
            compose: false
        }
    },
    components: {
        emailPreview,
        emailView,
        emailCompose
        // emailUpdate
    },
    computed: {
        emailsToDisplay() {
            if (this.filter === null & this.searchTerm === null) return this.emails
            return this.emails.filter(email => {
                if (this.filter === null) return true
                return this.filter === email.read
            }).filter(email => {
                if (!this.searchTerm.trim()) return true
                let regex = new RegExp(this.searchTerm.trim(), 'i')
                return email.subject.match(regex) || email.txt.match(regex)
            })
        }
        // emailsToDisplay() {
        //     if (this.filter === null) return this.emails
        //     return this.emails.filter(email => this.filter === email.read)
        // }
    },
    methods: {
        sort(by) {
            if (by === 'date') {
                if (this.sorted.by === 'date') this.sorted.firstToLast = !this.sorted.firstToLast
                else {this.sorted.by = 'date'; this.sorted.firstToLast = true}
                this.emails.sort((a, b) => {
                    return this.sorted.firstToLast? a.created - b.created : b.created - a.created
                })
            } else {
                if (this.sorted.by === 'subject') this.sorted.firstToLast = !this.sorted.firstToLast
                else {this.sorted.by = 'subject'; this.sorted.firstToLast = true}
                this.emails.sort((a, b) => {
                    let sortValue = (a.subject.toLowerCase() < b.subject.toLowerCase())? -1 : 1
                    return this.sorted.firstToLast? sortValue : -sortValue
                })
            }
        },
        markRead(ev) {
            EmailService.markRead(ev.id, ev.read)
            .then(email => {
                console.log('Find email in local array and mark read/unread')
            })
            .catch(err => console.error(err))
        },
        selectEmail(email) {
            this.emailSelected = email
            if (!email.read) this.markRead({id: email.id, read: true})
        },
        handleSent(email) {
            this.compose = false
            this.emails.push(email) // TODO: understand what was it that went wrong and made me fo this in the first place
        }
    },
    created() {
        EmailService.getEmails()
            .then(emails => {
                this.emails = emails
                this.sort('date')
            })
            .catch(err => console.log('Error loading emails from server:', err))
    }
}
