
import searchBar from './utils/searchBar.js'

export default {
    template: `
        <section class="map-container">
            <section class="controls">
                <div class="search">
                    <search-bar></search-bar>
                </div>
            <div class="buttons">
                <button v-if="showAdd" @click="addPlace" class="not-btn" title="Add location to your list of places">
                    <i class="fa fa-plus" aria-hidden="true" title="Add place to list"></i>
                </button>
                <button @click="showCurrentLocation" class="not-btn" title="Current Location">
                    <i class="fa fa-location-arrow" aria-hidden="true"></i>                    
                </button>
                <button @click="" class="not-btn" title="Copy URL to clipboard">
                    <i class="fa fa-clipboard" aria-hidden="true"></i>                    
                </button>
            </div>
        </section>

        <div class="actual-map"></div>
    </section>
    `,
    props: ['showAdd'],
    components: {
        searchBar
    },
    methods: {
        addPlace() {
            this.$emit('addPlace')
        },
        showCurrentLocation() {
            this.$emit('currentLocationReq')
        }
    }
}