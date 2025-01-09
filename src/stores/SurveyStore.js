// stores/survey.js
import { useRoute } from "vue-router";
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useSurveyStore = defineStore('survey', () => {
  const route = useRoute();

  const items = ref([]);
  const responses = ref([]);
  const rationales = ref([]);
  const comments = ref('');

  // Function to compute a unique storage key
  const getStorageKey = () => {
    const annotator = route.query.annotator;
    const dataset = route.query.dataset;
    if (!annotator || !dataset) return null;
    return `surveyStore-${annotator}-${dataset}-v1`;
  };

  // Load persisted data for this specific combination
  const loadFromLocalStorage = () => {
    const key = getStorageKey();
    if (!key) return;
    const data = JSON.parse(localStorage.getItem(key));

    if (data) {
      items.value = data.items;
      responses.value = data.responses;
      rationales.value = data.rationales;
      comments.value = data.comments;
    }
  };

  // Watch and persist data to localStorage under the unique key
  watch(
    () => ({
      items: items.value,
      responses: responses.value,
      rationales: rationales.value,
      comments: comments.value,
    }),
    (state) => {
      const key = getStorageKey();
      if (!key) return;
      localStorage.setItem(key, JSON.stringify(state));
    },
    { deep: true }
  );

  return {
    items,
    responses,
    rationales,
    comments,
    loadFromLocalStorage,
  };
});
