<template>
  <div class="check" id="checkPanel">
    <i class="gg-close" @click="closeShow()"></i>

    <div v-if="data.set != undefined">
      <h1>{{data.title}}</h1>

      <div class="quickcheck -box -round">
        <h2>Seasons</h2>
        <p>Locally available: {{data.set.episodes.local.length}}</p>
        <p>Remotly available: {{data.set.episodes.remote.length}}</p>
        <h3 v-if="data.set.episodes.local.length == data.set.episodes.remote.length" class="-status -green">Passed</h3>
        <h3 v-if="data.set.episodes.local.length != data.set.episodes.remote.length" class="-status -red">Failed</h3>
      </div>

      <div class="quickcheck -box -round">
        <h2>Episodes</h2>
        <p>Locally available: {{data.set.compare.local.episodes}}</p>
        <p>Remotly available: {{data.set.compare.remote.episodes}}</p>
        <h3 v-if="data.set.compare.status == true" class="-status -green">Passed</h3>
        <h3 v-if="data.set.compare.status == false" class="-status -red">Failed</h3>
      </div>
    </div>

    <div v-if="data.analysis != undefined">
      <div class="unscraped" v-if="data.analysis.overflow != false">
        <h1>Unscraped Episodes</h1>
        <div class="season" v-for="(season, index) of data.analysis.overflow" :key="season">
          <div v-if="season.looped != true">
            <h2>Season {{index + 1}}</h2>
              <table>
                <th>Title</th>
                <th>Link</th>
                <tr class="episode" v-for="episode in season.episodes" :key="episode">
                  <td>{{episode.title}}</td>
                  <td><a :href="episode.href">{{episode.href}}</a></td>
                </tr>
              </table>
          </div>
        </div>
      </div>
      
      <h1>Available Episodes</h1>
      <div class="season" v-for="season of data.analysis.combined" :key="season">
          <h2>Season {{season.index + 1}}</h2>
          <table>
                <th>Title local</th>
                <th>Vivo</th>
                <th>Title remote</th>
                <th>Match</th>
                <tr class="episode" v-for="episode in season.episodes" :key="episode">
                  <td><a :href="episode.local.link">{{episode.local.title}}</a></td>
                  <td><a :href="episode.local.vivo">{{episode.local.vivo}}</a></td>
                  <td><a :href="episode.remote.link">{{episode.remote.title}}</a></td>
                  <td v-if="episode.match == true"><p class="-status -green">Passed</p></td>
                  <td v-if="episode.match == false"><p class="-status -red">Failed</p></td>
                </tr>
              </table>
        </div>
    </div>

    <div class="spacer"></div>
  </div>
</template>

<script>
import {api} from "../config"
import {get} from "../fetch"
import {reactive, watch} from "vue"

export default {
  name: 'Show',
  props: {
    title: String,
  },
  setup(props, context) {
    const data = reactive({})
    const debug = false

    async function init(title) {
      console.log("Loading", title);
      var dataset = {"compare":{"local":{"episodes":64},"remote":{"episodes":64},"status":true},"episodes":{"remote":[{"episodes":[{"href":"https://bs.to/serie/Abenteuer-Survival/1/1-In-der-Moabwueste-Allein-in-der-Wueste/de","title":"In der Moabwüste (Allein in der Wüste)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/2-In-der-Sierra-Nevada-Allein-in-der-Sierra-Nevada/de","title":"In der Sierra Nevada (Allein in der Sierra Nevada)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/3-Truegerische-Gletscher-Allein-in-Fels-und-Eis/de","title":"Trügerische Gletscher (Allein in Fels und Eis)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/4-In-der-gruenen-Hoelle-Allein-in-der-gruenen-Hoelle/de","title":"In der grünen Hölle (Allein in der grünen Hölle)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/5-Durch-die-Wildnis-Alaskas-Allein-durch-die-Wildnis-Alaskas/de","title":"Durch die Wildnis Alaskas (Allein durch die Wildnis Alaskas)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/6-Am-Krater-des-Mount-Kilauea-Allein-auf-den-Vulkanbergen-Hawaiis/de","title":"Am Krater des Mount Kilauea (Allein auf den Vulkanbergen Hawaiis)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/7-Mitten-im-Pazifik-Allein-im-Pazifik/de","title":"Mitten im Pazifik (Allein im Pazifik)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/8-Gnadenlose-Savanne-Allein-in-der-Savanne/de","title":"Gnadenlose Savanne (Allein in der Savanne)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/9-In-den-Suempfen-der-Everglades-Allein-in-den-Suempfen-der-Everglades/de","title":"In den Sümpfen der Everglades (Allein in den Sümpfen der Everglades)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/10-Im-Dschungel-von-Ecuador-Allein-im-Dschungel/de","title":"Im Dschungel von Ecuador (Allein im Dschungel)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/11-In-der-Hitze-Australiens-Allein-im-australischen-Outback/de","title":"In der Hitze Australiens (Allein im australischen Outback)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/12-In-den-Canyons-von-Mexiko-Allein-in-den-Canyons-von-Mexiko/de","title":"In den Canyons von Mexiko (Allein in den Canyons von Mexiko)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/13-Auf-den-Gletschern-Islands-Allein-auf-den-Gletschern-Islands/de","title":"Auf den Gletschern Islands (Allein auf den Gletschern Islands)"},{"href":"https://bs.to/serie/Abenteuer-Survival/1/14-In-den-schottischen-Highlands-Allein-in-den-schottischen-Highlands/de","title":"In den schottischen Highlands (Allein in den schottischen Highlands)"}]},{"episodes":[{"href":"https://bs.to/serie/Abenteuer-Survival/2/1-Sahara-Skorpione-zum-Fruehstueck/de","title":"Sahara - Skorpione zum Frühstück"},{"href":"https://bs.to/serie/Abenteuer-Survival/2/2-Sahara-Das-Gesetz-der-Berber/de","title":"Sahara - Das Gesetz der Berber"},{"href":"https://bs.to/serie/Abenteuer-Survival/2/3-Panama-1/de","title":"Panama (1)"},{"href":"https://bs.to/serie/Abenteuer-Survival/2/4-Panama-2/de","title":"Panama (2)"},{"href":"https://bs.to/serie/Abenteuer-Survival/2/5-Patagonien-1/de","title":"Patagonien (1)"},{"href":"https://bs.to/serie/Abenteuer-Survival/2/6-Patagonien-2/de","title":"Patagonien (2)"},{"href":"https://bs.to/serie/Abenteuer-Survival/2/7-Bear-isst-einfach-alles/de","title":"Bear isst einfach alles"}]},{"episodes":[{"href":"https://bs.to/serie/Abenteuer-Survival/3/1-Die-sibirische-Tundra-1/de","title":"Die sibirische Tundra (1)"},{"href":"https://bs.to/serie/Abenteuer-Survival/3/2-Die-sibirische-Tundra-2/de","title":"Die sibirische Tundra (2)"},{"href":"https://bs.to/serie/Abenteuer-Survival/3/3-An-der-Skelettkueste/de","title":"An der Skelettküste"},{"href":"https://bs.to/serie/Abenteuer-Survival/3/4-Zambia-Krank-im-Busch/de","title":"Zambia - Krank im Busch"},{"href":"https://bs.to/serie/Abenteuer-Survival/3/5-Allein-auf-der-Vulkaninsel-1/de","title":"Allein auf der Vulkaninsel (1)"},{"href":"https://bs.to/serie/Abenteuer-Survival/3/6-Allein-auf-der-Vulkaninstel-2/de","title":"Allein auf der Vulkaninstel (2)"}]},{"episodes":[{"href":"https://bs.to/serie/Abenteuer-Survival/4/1-In-der-Wueste-Mexikos","title":"Baja Desert"},{"href":"https://bs.to/serie/Abenteuer-Survival/4/2-In-den-Suempfen-Louisianas","title":"The Deep South"},{"href":"https://bs.to/serie/Abenteuer-Survival/4/3-An-der-Steilkueste-Irlands","title":"Ireland"},{"href":"https://bs.to/serie/Abenteuer-Survival/4/4-In-der-Praerie-Sued-Dakotas","title":"South Dakota"},{"href":"https://bs.to/serie/Abenteuer-Survival/4/5-Im-Yukon-Territorium","title":"Yukon"},{"href":"https://bs.to/serie/Abenteuer-Survival/4/6-In-den-Karpaten","title":"Romania"},{"href":"https://bs.to/serie/Abenteuer-Survival/4/7-Im-anatolischen-Gebirge","title":"Turkey"},{"href":"https://bs.to/serie/Abenteuer-Survival/4/8-Im-Dschungel-von-Belize","title":"Belize"},{"href":"https://bs.to/serie/Abenteuer-Survival/4/9-Im-Karibikdschungel","title":"Dominican Republic"},{"href":"https://bs.to/serie/Abenteuer-Survival/4/10-In-den-Canyons-von-Oregon","title":"Oregon"}]},{"episodes":[{"href":"https://bs.to/serie/Abenteuer-Survival/5/1-Der-Canyon/de","title":"Der Canyon"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/2-Ueberlebenskampf-in-der-Wueste/de","title":"Überlebenskampf in der Wüste"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/3-Eisiges-Alaska/de","title":"Eisiges Alaska"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/4-Im-Dschungel-Vietnams/de","title":"Im Dschungel Vietnams"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/5-Am-Polarkreis/de","title":"Am Polarkreis"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/6-Auf-den-pazifischen-Inseln/de","title":"Auf den pazifischen Inseln"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/7-Gnadenlose-Rocky-Mountains/de","title":"Gnadenlose Rocky Mountains"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/8-In-China/de","title":"In China"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/9-Gefaehrliches-Guatemala/de","title":"Gefährliches Guatemala"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/10-Im-Grossstadt-Dschungel/de","title":"Im Großstadt-Dschungel"},{"href":"https://bs.to/serie/Abenteuer-Survival/5/11-Verloren-in-Nord-Afrika/de","title":"Verloren in Nord-Afrika"}]},{"episodes":[{"href":"https://bs.to/serie/Abenteuer-Survival/6/1-In-Georgien/de","title":"In Georgien"},{"href":"https://bs.to/serie/Abenteuer-Survival/6/2-Auf-den-Torres-Strait-Inseln/de","title":"Auf den Torres-Strait-Inseln"},{"href":"https://bs.to/serie/Abenteuer-Survival/6/3-In-Australien/de","title":"In Australien"},{"href":"https://bs.to/serie/Abenteuer-Survival/6/4-In-der-Mojave-Wueste/de","title":"In der Mojave-Wüste"},{"href":"https://bs.to/serie/Abenteuer-Survival/6/5-Zuschauer-Special/de","title":"Zuschauer-Special"}]},{"episodes":[{"href":"https://bs.to/serie/Abenteuer-Survival/7/1-In-der-Wueste-Arizonas/de","title":"In der Wüste Arizonas"},{"href":"https://bs.to/serie/Abenteuer-Survival/7/2-In-Schottland-gestrandet/de","title":"In Schottland gestrandet"},{"href":"https://bs.to/serie/Abenteuer-Survival/7/3-Norwegen-Land-der-Extreme/de","title":"Norwegen : Land der Extreme"},{"href":"https://bs.to/serie/Abenteuer-Survival/7/4-Im-Dschungel-Borneos/de","title":" Im Dschungel Borneos"},{"href":"https://bs.to/serie/Abenteuer-Survival/7/5-Auf-den-Inseln-Malaysias/de","title":"Auf den Inseln Malaysias"},{"href":"https://bs.to/serie/Abenteuer-Survival/7/6-Rund-um-die-Welt/de","title":"Rund um die Welt"}]},{"episodes":[{"href":"https://bs.to/serie/Abenteuer-Survival/8/1-Jake-Gyllenhaal-Special/de","title":"Jake Gyllenhaal-Special"},{"href":"https://bs.to/serie/Abenteuer-Survival/8/2-In-den-Weiten-Neuseelands/de","title":"In den Weiten Neuseelands"},{"href":"https://bs.to/serie/Abenteuer-Survival/8/3-Feuer-Eis-auf-Island/de","title":"Feuer & Eis auf Island"},{"href":"https://bs.to/serie/Abenteuer-Survival/8/4-Im-Wilden-Westen/de","title":"Im Wilden Westen"},{"href":"https://bs.to/serie/Abenteuer-Survival/8/5-Im-Land-der-Maori/de","title":"Im Land der Maori"}]}],"local":[{"episodes":[{"ID":13,"ID_show":2,"ID_season":1,"title":"In der Moabwüste (Allein in der Wüste)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/1-In-der-Moabwueste-Allein-in-der-Wueste/","vivo_link":"https://vivo.sx/2ccb26ab17"},{"ID":14,"ID_show":2,"ID_season":1,"title":"In der Sierra Nevada (Allein in der Sierra Nevada)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/2-In-der-Sierra-Nevada-Allein-in-der-Sierra-Nevada/","vivo_link":"error:notAvailable"},{"ID":15,"ID_show":2,"ID_season":1,"title":"Trügerische Gletscher (Allein in Fels und Eis)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/3-Truegerische-Gletscher-Allein-in-Fels-und-Eis/","vivo_link":"https://vivo.sx/01c0108bbc"},{"ID":16,"ID_show":2,"ID_season":1,"title":"In der grünen Hölle (Allein in der grünen Hölle)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/4-In-der-gruenen-Hoelle-Allein-in-der-gruenen-Hoelle/","vivo_link":"https://vivo.sx/5c82c245c4"},{"ID":17,"ID_show":2,"ID_season":1,"title":"Durch die Wildnis Alaskas (Allein durch die Wildnis Alaskas)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/5-Durch-die-Wildnis-Alaskas-Allein-durch-die-Wildnis-Alaskas/","vivo_link":"https://vivo.sx/56e4e52a52"},{"ID":18,"ID_show":2,"ID_season":1,"title":"Am Krater des Mount Kilauea (Allein auf den Vulkanbergen Hawaiis)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/6-Am-Krater-des-Mount-Kilauea-Allein-auf-den-Vulkanbergen-Hawaiis/","vivo_link":"https://vivo.sx/5be19d1859"},{"ID":19,"ID_show":2,"ID_season":1,"title":"Mitten im Pazifik (Allein im Pazifik)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/7-Mitten-im-Pazifik-Allein-im-Pazifik/","vivo_link":"error:notAvailable"},{"ID":20,"ID_show":2,"ID_season":1,"title":"Gnadenlose Savanne (Allein in der Savanne)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/8-Gnadenlose-Savanne-Allein-in-der-Savanne/","vivo_link":"https://vivo.sx/2ac6b62d35"},{"ID":21,"ID_show":2,"ID_season":1,"title":"In den Sümpfen der Everglades (Allein in den Sümpfen der Everglades)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/9-In-den-Suempfen-der-Everglades-Allein-in-den-Suempfen-der-Everglades/","vivo_link":"https://vivo.sx/8995047540"},{"ID":22,"ID_show":2,"ID_season":1,"title":"Im Dschungel von Ecuador (Allein im Dschungel)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/10-Im-Dschungel-von-Ecuador-Allein-im-Dschungel/","vivo_link":"https://vivo.sx/ff54663785"},{"ID":23,"ID_show":2,"ID_season":1,"title":"In der Hitze Australiens (Allein im australischen Outback)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/11-In-der-Hitze-Australiens-Allein-im-australischen-Outback/","vivo_link":"error:notAvailable"},{"ID":24,"ID_show":2,"ID_season":1,"title":"In den Canyons von Mexiko (Allein in den Canyons von Mexiko)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/12-In-den-Canyons-von-Mexiko-Allein-in-den-Canyons-von-Mexiko/","vivo_link":"https://vivo.sx/89a5f827e1"},{"ID":25,"ID_show":2,"ID_season":1,"title":"Auf den Gletschern Islands (Allein auf den Gletschern Islands)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/13-Auf-den-Gletschern-Islands-Allein-auf-den-Gletschern-Islands/","vivo_link":"https://vivo.sx/b132129038"},{"ID":26,"ID_show":2,"ID_season":1,"title":"In den schottischen Highlands (Allein in den schottischen Highlands)","bs_link":"https://bs.to/serie/Abenteuer-Survival/1/14-In-den-schottischen-Highlands-Allein-in-den-schottischen-Highlands/","vivo_link":"error:notAvailable"}]},{"episodes":[{"ID":27,"ID_show":2,"ID_season":2,"title":"Sahara - Skorpione zum Frühstück","bs_link":"https://bs.to/serie/Abenteuer-Survival/2/1-Sahara-Skorpione-zum-Fruehstueck/","vivo_link":"https://vivo.sx/a483f5ca1a"},{"ID":28,"ID_show":2,"ID_season":2,"title":"Sahara - Das Gesetz der Berber","bs_link":"https://bs.to/serie/Abenteuer-Survival/2/2-Sahara-Das-Gesetz-der-Berber/","vivo_link":"https://vivo.sx/cd26a3a90b"},{"ID":29,"ID_show":2,"ID_season":2,"title":"Panama (1)","bs_link":"https://bs.to/serie/Abenteuer-Survival/2/3-Panama-1/","vivo_link":"https://vivo.sx/580f0e6cbe"},{"ID":30,"ID_show":2,"ID_season":2,"title":"Panama (2)","bs_link":"https://bs.to/serie/Abenteuer-Survival/2/4-Panama-2/","vivo_link":"https://vivo.sx/a7e5cc0c90"},{"ID":31,"ID_show":2,"ID_season":2,"title":"Patagonien (1)","bs_link":"https://bs.to/serie/Abenteuer-Survival/2/5-Patagonien-1/","vivo_link":"https://vivo.sx/357ad9b96c"},{"ID":32,"ID_show":2,"ID_season":2,"title":"Patagonien (2)","bs_link":"https://bs.to/serie/Abenteuer-Survival/2/6-Patagonien-2/","vivo_link":"error:notAvailable"},{"ID":33,"ID_show":2,"ID_season":2,"title":"Bear isst einfach alles","bs_link":"https://bs.to/serie/Abenteuer-Survival/2/7-Bear-isst-einfach-alles/","vivo_link":"https://vivo.sx/a3fc4f4a48"}]},{"episodes":[{"ID":34,"ID_show":2,"ID_season":3,"title":"Die sibirische Tundra (1)","bs_link":"https://bs.to/serie/Abenteuer-Survival/3/1-Die-sibirische-Tundra-1/","vivo_link":"https://vivo.sx/61bcfd8338"},{"ID":35,"ID_show":2,"ID_season":3,"title":"Die sibirische Tundra (2)","bs_link":"https://bs.to/serie/Abenteuer-Survival/3/2-Die-sibirische-Tundra-2/","vivo_link":"error:notAvailable"},{"ID":36,"ID_show":2,"ID_season":3,"title":"An der Skelettküste","bs_link":"https://bs.to/serie/Abenteuer-Survival/3/3-An-der-Skelettkueste/","vivo_link":"https://vivo.sx/56abde9116"},{"ID":37,"ID_show":2,"ID_season":3,"title":"Zambia - Krank im Busch","bs_link":"https://bs.to/serie/Abenteuer-Survival/3/4-Zambia-Krank-im-Busch/","vivo_link":"error:notAvailable"},{"ID":38,"ID_show":2,"ID_season":3,"title":"Allein auf der Vulkaninsel (1)","bs_link":"https://bs.to/serie/Abenteuer-Survival/3/5-Allein-auf-der-Vulkaninsel-1/","vivo_link":"https://vivo.sx/c263772b88"},{"ID":39,"ID_show":2,"ID_season":3,"title":"Allein auf der Vulkaninstel (2)","bs_link":"https://bs.to/serie/Abenteuer-Survival/3/6-Allein-auf-der-Vulkaninstel-2/","vivo_link":"https://vivo.sx/d9c2c4c5f4"}]},{"episodes":[{"ID":40,"ID_show":2,"ID_season":4,"title":"Baja Desert","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/1-In-der-Wueste-Mexik","vivo_link":"error:notAvailable"},{"ID":41,"ID_show":2,"ID_season":4,"title":"The Deep South","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/2-In-den-Suempfen-Louisian","vivo_link":"error:notAvailable"},{"ID":42,"ID_show":2,"ID_season":4,"title":"Ireland","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/3-An-der-Steilkueste-Irlan","vivo_link":"error:notAvailable"},{"ID":43,"ID_show":2,"ID_season":4,"title":"South Dakota","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/4-In-der-Praerie-Sued-Dakot","vivo_link":"error:notAvailable"},{"ID":44,"ID_show":2,"ID_season":4,"title":"Yukon","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/5-Im-Yukon-Territori","vivo_link":"error:notAvailable"},{"ID":45,"ID_show":2,"ID_season":4,"title":"Romania","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/6-In-den-Karpat","vivo_link":"error:notAvailable"},{"ID":46,"ID_show":2,"ID_season":4,"title":"Turkey","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/7-Im-anatolischen-Gebir","vivo_link":"error:notAvailable"},{"ID":47,"ID_show":2,"ID_season":4,"title":"Belize","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/8-Im-Dschungel-von-Beli","vivo_link":"error:notAvailable"},{"ID":48,"ID_show":2,"ID_season":4,"title":"Dominican Republic","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/9-Im-Karibikdschung","vivo_link":"error:notAvailable"},{"ID":49,"ID_show":2,"ID_season":4,"title":"Oregon","bs_link":"https://bs.to/serie/Abenteuer-Survival/4/10-In-den-Canyons-von-Oreg","vivo_link":"error:notAvailable"}]},{"episodes":[{"ID":50,"ID_show":2,"ID_season":5,"title":"Der Canyon","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/1-Der-Canyon/","vivo_link":"error:notAvailable"},{"ID":51,"ID_show":2,"ID_season":5,"title":"Überlebenskampf in der Wüste","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/2-Ueberlebenskampf-in-der-Wueste/","vivo_link":"error:notAvailable"},{"ID":52,"ID_show":2,"ID_season":5,"title":"Eisiges Alaska","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/3-Eisiges-Alaska/","vivo_link":"https://vivo.sx/80aa445feb"},{"ID":53,"ID_show":2,"ID_season":5,"title":"Im Dschungel Vietnams","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/4-Im-Dschungel-Vietnams/","vivo_link":"https://vivo.sx/4240038faa"},{"ID":54,"ID_show":2,"ID_season":5,"title":"Am Polarkreis","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/5-Am-Polarkreis/","vivo_link":"error:notAvailable"},{"ID":55,"ID_show":2,"ID_season":5,"title":"Auf den pazifischen Inseln","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/6-Auf-den-pazifischen-Inseln/","vivo_link":"https://vivo.sx/b8940bc524"},{"ID":56,"ID_show":2,"ID_season":5,"title":"Gnadenlose Rocky Mountains","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/7-Gnadenlose-Rocky-Mountains/","vivo_link":"https://vivo.sx/299e1f4c55"},{"ID":57,"ID_show":2,"ID_season":5,"title":"In China","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/8-In-China/","vivo_link":"https://vivo.sx/3f5cc54a6a"},{"ID":58,"ID_show":2,"ID_season":5,"title":"Gefährliches Guatemala","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/9-Gefaehrliches-Guatemala/","vivo_link":"https://vivo.sx/1ecb455293"},{"ID":59,"ID_show":2,"ID_season":5,"title":"Im Großstadt-Dschungel","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/10-Im-Grossstadt-Dschungel/","vivo_link":"https://vivo.sx/0e0cf5a579"},{"ID":60,"ID_show":2,"ID_season":5,"title":"Verloren in Nord-Afrika","bs_link":"https://bs.to/serie/Abenteuer-Survival/5/11-Verloren-in-Nord-Afrika/","vivo_link":"https://vivo.sx/e36837adf5"}]},{"episodes":[{"ID":61,"ID_show":2,"ID_season":6,"title":"In Georgien","bs_link":"https://bs.to/serie/Abenteuer-Survival/6/1-In-Georgien/","vivo_link":"error:notAvailable"},{"ID":62,"ID_show":2,"ID_season":6,"title":"Auf den Torres-Strait-Inseln","bs_link":"https://bs.to/serie/Abenteuer-Survival/6/2-Auf-den-Torres-Strait-Inseln/","vivo_link":"error:notAvailable"},{"ID":63,"ID_show":2,"ID_season":6,"title":"In Australien","bs_link":"https://bs.to/serie/Abenteuer-Survival/6/3-In-Australien/","vivo_link":"https://vivo.sx/47b59e5340"},{"ID":64,"ID_show":2,"ID_season":6,"title":"In der Mojave-Wüste","bs_link":"https://bs.to/serie/Abenteuer-Survival/6/4-In-der-Mojave-Wueste/","vivo_link":"https://vivo.sx/be50a975c4"},{"ID":65,"ID_show":2,"ID_season":6,"title":"Zuschauer-Special","bs_link":"https://bs.to/serie/Abenteuer-Survival/6/5-Zuschauer-Special/","vivo_link":"https://vivo.sx/da56fea257"}]},{"episodes":[{"ID":66,"ID_show":2,"ID_season":7,"title":"In der Wüste Arizonas","bs_link":"https://bs.to/serie/Abenteuer-Survival/7/1-In-der-Wueste-Arizonas/","vivo_link":"error:notAvailable"},{"ID":67,"ID_show":2,"ID_season":7,"title":"In Schottland gestrandet","bs_link":"https://bs.to/serie/Abenteuer-Survival/7/2-In-Schottland-gestrandet/","vivo_link":"error:notAvailable"},{"ID":68,"ID_show":2,"ID_season":7,"title":"Norwegen : Land der Extreme","bs_link":"https://bs.to/serie/Abenteuer-Survival/7/3-Norwegen-Land-der-Extreme/","vivo_link":"error:notAvailable"},{"ID":69,"ID_show":2,"ID_season":7,"title":" Im Dschungel Borneos","bs_link":"https://bs.to/serie/Abenteuer-Survival/7/4-Im-Dschungel-Borneos/","vivo_link":"error:notAvailable"},{"ID":70,"ID_show":2,"ID_season":7,"title":"Auf den Inseln Malaysias","bs_link":"https://bs.to/serie/Abenteuer-Survival/7/5-Auf-den-Inseln-Malaysias/","vivo_link":"https://vivo.sx/1a6f7150e1"},{"ID":71,"ID_show":2,"ID_season":7,"title":"Rund um die Welt","bs_link":"https://bs.to/serie/Abenteuer-Survival/7/6-Rund-um-die-Welt/","vivo_link":"https://vivo.sx/0cefffc571"}]},{"episodes":[{"ID":72,"ID_show":2,"ID_season":8,"title":"Jake Gyllenhaal-Special","bs_link":"https://bs.to/serie/Abenteuer-Survival/8/1-Jake-Gyllenhaal-Special/","vivo_link":"https://vivo.sx/90cb3710f6"},{"ID":73,"ID_show":2,"ID_season":8,"title":"In den Weiten Neuseelands","bs_link":"https://bs.to/serie/Abenteuer-Survival/8/2-In-den-Weiten-Neuseelands/","vivo_link":"error:notAvailable"},{"ID":74,"ID_show":2,"ID_season":8,"title":"Feuer & Eis auf Island","bs_link":"https://bs.to/serie/Abenteuer-Survival/8/3-Feuer-Eis-auf-Island/","vivo_link":"https://vivo.sx/3b6fdc2acc"},{"ID":75,"ID_show":2,"ID_season":8,"title":"Im Wilden Westen","bs_link":"https://bs.to/serie/Abenteuer-Survival/8/4-Im-Wilden-Westen/","vivo_link":"https://vivo.sx/103c94515f"},{"ID":76,"ID_show":2,"ID_season":8,"title":"Im Land der Maori","bs_link":"https://bs.to/serie/Abenteuer-Survival/8/5-Im-Land-der-Maori/","vivo_link":"https://vivo.sx/a5d971f44e"}]}]}}
      console.log(dataset);
      data.title = title
      if (!debug) {
        dataset = await get(`${api.dev}/grabber/check/${title}`)
      }

      data.set = dataset

      const analysis =analyze(dataset.episodes)
      console.log(analysis);

      data.analysis = analysis

      document.getElementById("checkPanel").classList.add("active")
    }

    function checkLinkMatch(l1, l2) {
      if (l1.includes(l2) || l2.includes(l1)) {
        return true
      }

      return false
    }

    function analyze(set) {
      console.log(set);
      const seasons = []
      var episodesMissing = false
      var episodesUnavailable = 0

      if (set.local.length < set.remote.length) {
        episodesMissing = true
      }

      set.local.forEach((season, sIndex) => {
        var remoteSeason = set.remote[sIndex]

        if (season.episodes.length < remoteSeason.episodes.length) {
          episodesMissing = true
        }

        if (remoteSeason == undefined) {
          remoteSeason = {
            episodes: []
          }
        }
        if (season.episodes.length >= remoteSeason.episodes.length) {
          remoteSeason.looped = true
        }
        const result = []

        season.episodes.forEach((episode, eIndex) => {
          var remoteEpisode = remoteSeason.episodes[eIndex]
          let stringCheck = true

          if (remoteEpisode != undefined) {
            remoteEpisode.looped = true

            if (episode.title != remoteEpisode.title || !checkLinkMatch(episode.bs_link, remoteSeason.episodes[eIndex].href)) {
              stringCheck = false
            }
          }
          else {
            remoteEpisode = {
              title: "unavailable",
              link: "unavailable"
            }

            stringCheck = false
          }

          result.push({
            match: stringCheck,
            index: eIndex,
            local: {
              title: episode.title,
              link: episode.bs_link,
              vivo: episode.vivo_link
            },
            remote: {
              title: remoteEpisode.title,
              link: remoteEpisode.href
            }
          })
        })

        seasons.push({
          index: sIndex,
          episodes: result
        })
      })

      console.log(seasons);
      console.log(set);

      let overflow = set.remote
      if (!episodesMissing) {
        overflow = false
      }

      return {
        combined: seasons,
        overflow: overflow
      }
    }

    function closeShow() {
      document.getElementById("checkPanel").classList.remove("active")
    }

    watch(() => props.title, async () => {
        if (props.title != undefined) {
          init(props.title)
        }
    })

    return {data, closeShow}  }
}
</script>

<style scoped>
  .check {
    width: calc(100% - 30px);
    height: 100vh;
    overflow: scroll;
    background-color: var(--white);
    visibility: hidden;
    position: fixed;
    top: 100vh;
    left: 0;
    z-index: 200;
    padding: 15px;
    opacity: 0;
  }

  h1 {
    margin-bottom: 20px;
  }

  .unscraped {
    box-shadow: 0px 0px 8px red;
    padding: 10px;
    margin-top: 40px;
    margin-bottom: 40px;
  }

  .gg-close {
    position: absolute;
    top: 20px;
    right: 20px;
    transform: scale(1.3);
    cursor: pointer;
    opacity: .8;
  }

  .gg-close:hover {
    opacity: 1;
  }

  .active {
    visibility: visible;
    opacity: 1;
    top: 0;
  }

  h2 {
    margin-bottom: 20px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 30px;
  }

  th, td {
    padding: 5px;
    text-align: left;
  }

  tr:nth-child(even) {background: rgb(218, 213, 215)}

  th {
    background-color: var(--blue);
    color: var(--white)
  }

  .spacer {
    height: 30px;
  }

  .quickcheck .-status {
    margin-top: 15px;
  }
</style>
