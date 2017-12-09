
import PlacesService from '../service/placesService.js'
import {initMap, initSearch} from '../js/mapInit.js'
import mapContainer from '../cmps/mapContainer.js'
import placePreview from '../cmps/placePreview.js'
import placeDetails from '../cmps/placeDetails.js'
import placeEdit from '../cmps/placeEdit.js'

export default {
    template: `
        <section class="places-app">

            <map-container @addPlace="addPlaceMode" @currentLocationReq="markCurrentLocation"></map-container>
            <place-edit v-if="placeToEdit" :place="placeToEdit" @submit="savePlace"></place-edit>

            <div class="places">
                <ul class="places-list">
                    <place-preview v-for="place in places" :key="place.id" :place="place"></place-preview>
                </ul>

                <place-details v-if="placeSelected" :place="selectedPlace" :countStr="3"></place-details>
            </div>

        </section>
    `,
    data() {
        return {
            places: [],
            placeSelected: false,
            map: null,
            markers: [],
            tempMarker: new google.maps.Marker(),
            placeToEdit: null
        }
    },
    computed: {
        selectedPlace() {
            if (this.placeSelected) return this.places[0]
        }
    },
    components: {
        mapContainer,
        placePreview,
        placeDetails,
        placeEdit
    },
    methods: {
        showTempMarker(coords) {
            this.map.panTo(coords)
            this.tempMarker.setPosition(coords)
            this.tempMarker.setAnimation(google.maps.Animation.DROP)
            this.tempMarker.addListener('click', _=> this.placeToEdit = PlacesService.getEmptyPlace())
        },
        addPlaceMode() {
            this.placeToEdit = PlacesService.getEmptyPlace()
        },
        savePlace(place) {
            this.placeToEdit = null
            if(!place) return
            if (!place.id) {
                place.coords = {
                    lat: this.tempMarker.position.lat(),
                    lng: this.tempMarker.position.lng()
                }
                PlacesService.savePlace(place)
                .then(place => {
                    console.log('Push place into  local places array')
                    this.getPlaceMarker(place).setMap(this.map)
                })
                .catch(err => console.error('An error occured:', err))
            } else PlacesService.savePlace(place).then(place => {
                console.log('Use splice to replace previous place details with the updated ones or query for the new places array')
            }).catch(err => console.error('An error occured:', err))
        },
        getPlaceMarker({coords, tag, id}) {
            var marker = new google.maps.Marker({
                position: coords,
                icon: `../img/push-pin-${tag}.svg`,
                places_id: id,
                animation: google.maps.Animation.DROP
            })
            marker.addListener('click', (ev => console.log(ev, marker.places_id)))

            return marker
        },
        markCurrentLocation(fallbackCoords) {
            navigator.geolocation.getCurrentPosition(location => {
                var coords = {lat: location.coords.latitude, lng: location.coords.longitude};
                this.showTempMarker(coords);
            }, err => {
                console.log(err);
                if (!fallbackCoords) return;
                // TODO: Indicate to user that current location was not handled.
        
                this.showTempMarker(fallbackCoords)
            });
        }
    },
    created() {
        PlacesService.query().then(places => {
            this.places = places
            this.markers = places.map(place => this.getPlaceMarker(place))
            this.markers.forEach((marker, i) => {
                setTimeout(_=> marker.setMap(this.map), i * 300)
            })

            // this.markers = places.map(place => ({
            //     marker: new google.maps.Marker({
            //         position: place.coords,
            //         icon: `../img/push-pin-${place.tag}.svg`,
            //         places_id: place.id
            //     })
            // }))
            // this.markers.forEach(({marker}, i) => {
            //     marker.setAnimation(google.maps.Animation.DROP)
            //     setTimeout(_=> marker.setMap(this.map), i * 300)
            //     // marker.addListener('click', ({latLng}) => console.log(latLng.lat(), latLng.lng()))
            //     marker.addListener('click', (ev => console.log(ev, marker.places_id)))
            // })

            this.placeSelected = true
        })
    },
    mounted() {
        this.map = initMap()
        this.tempMarker.setMap(this.map)
        var autoComplete = initSearch()
        autoComplete.addListener('place_changed', () => {
            let place = autoComplete.getPlace()
            console.log('place_changed');
            if (!place.geometry) {
                console.log('Searched for:', place.name)
                console.log('TODO use geocoding to try to get the coordinates')
                return;
            }
            let coords = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            }
            
            this.showTempMarker(coords)
        })
    }
}
