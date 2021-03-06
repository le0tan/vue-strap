import { getFragmentByHash, toBoolean, toNumber } from '../utils/utils';
import md from '../utils/markdown';

const slugify = require('@sindresorhus/slugify');

export default {
  props: {
    header: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: null,
    },
    expandable: {
      type: Boolean,
      default: true,
    },
    isOpen: {
      type: Boolean,
      default: null,
    },
    expanded: {
      type: Boolean,
      default: null,
    },
    minimized: {
      type: Boolean,
      default: false,
    },
    noSwitch: {
      type: Boolean,
      default: false,
    },
    noClose: {
      type: Boolean,
      default: false,
    },
    popupUrl: {
      type: String,
      default: null,
    },
    src: {
      type: String,
    },
    bottomSwitch: {
      type: Boolean,
      default: true,
    },
    preload: {
      type: Boolean,
      default: false,
    },
    addClass: {
      type: String,
      default: '',
    },
  },
  computed: {
    // Vue 2.0 coerce migration
    expandableBool() {
      return toBoolean(this.expandable);
    },
    isOpenBool() {
      return toBoolean(this.isOpen);
    },
    expandedBool() {
      return toBoolean(this.expanded);
    },
    minimizedBool() {
      return toBoolean(this.minimized);
    },
    noSwitchBool() {
      return toBoolean(this.noSwitch);
    },
    noCloseBool() {
      return toBoolean(this.noClose);
    },
    bottomSwitchBool() {
      return toBoolean(this.bottomSwitch);
    },
    preloadBool() {
      return toBoolean(this.preload);
    },
    // Vue 2.0 coerce migration end
    isExpandableCard() {
      return this.expandableBool;
    },
    headerContent() {
      return md.render(this.header);
    },
    altContent() {
      return (this.alt && md.render(this.alt)) || md.render(this.header);
    },
    hasSrc() {
      return this.src && this.src.length > 0;
    },
  },
  data() {
    return {
      onHeaderHover: false,
      localExpanded: false,
      localMinimized: false,
      isCached: false,
    };
  },
  methods: {
    toggle() {
      this.localExpanded = !this.localExpanded;
      if (this.localExpanded) {
        this.isCached = true;
      }
    },
    expand() {
      this.localExpanded = !this.localExpanded;
      if (this.localExpanded) {
        this.isCached = true;
      }
    },
    close() {
      this.localMinimized = true;
    },
    open() {
      this.localExpanded = true;
      this.isCached = true;
      this.localMinimized = false;
    },
    scrollIntoViewIfNeeded() {
      const top = this.$el.getBoundingClientRect().top;
      const isTopInView = (top >= 0) && (top <= window.innerHeight);
      if (!isTopInView) {
        this.$el.scrollIntoView();
      }
    },
    collapseThenScrollIntoViewIfNeeded() {
      this.$once('is-open-event', (el, isOpen) => {
        this.scrollIntoViewIfNeeded();
      });
      this.expand();
    },
    openPopup() {
      window.open(this.popupUrl);
    },
  },
  created() {
    if (this.src) {
      const hash = getFragmentByHash(this.src);
      if (hash) {
        this.fragment = hash;
        this.src = this.src.split('#')[0];
      }
    }
    // Edge case where user might want non-expandable card that isn't expanded by default
    const notExpandableNoExpand = !this.expandableBool && this.expanded !== 'false';
    // Set local data to computed prop value
    this.localExpanded = notExpandableNoExpand || this.expandedBool; // Ensure this expr ordering is maintained
    this.isCached = this.localExpanded; // If it is expanded, it will be cached.
    this.localMinimized = this.minimizedBool;
  },
  mounted() {
    if (this.headerContent) {
      const panelHeaderText = jQuery(this.headerContent).wrap('<div></div>').parent().find(':header')
        .text();
      if (panelHeaderText) {
        this.$refs.cardContainer.setAttribute('id', slugify(panelHeaderText, { decamelize: false }));
      }
    } else if (this.$refs.headerWrapper.innerHTML) {
      const header = jQuery(this.$refs.headerWrapper.innerHTML).wrap('<div></div>').parent().find(':header');
      if (header.length > 0) {
        this.$refs.cardContainer.setAttribute('id', header[0].id);
      }
    }
  },
};