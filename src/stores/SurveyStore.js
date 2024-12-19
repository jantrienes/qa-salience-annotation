// stores/survey.js
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useSurveyStore = defineStore('survey', () => {
  const dataset = ref(null);
  const annotator = ref(null);
  const items = ref([]);
  const responses = ref([]);
  const rationales = ref([]);
  const comments = ref('');

  // Function to compute a unique storage key
  const getStorageKey = () => `surveyStore-${annotator.value}-${dataset.value}`;

  // Load persisted data for this specific combination
  const loadFromLocalStorage = () => {
    if (!annotator.value || !dataset.value) return;
    const data = JSON.parse(localStorage.getItem(getStorageKey()));
    if (data) {
      dataset.value = data.dataset;
      annotator.value = data.annotator;
      items.value = data.items;
      responses.value = data.responses;
      rationales.value = data.rationales;
      comments.value = data.comments;
    }
  };

  // Watch and persist data to localStorage under the unique key
  watch(
    () => ({
      dataset: dataset.value,
      annotator: annotator.value,
      items: items.value,
      responses: responses.value,
      rationales: rationales.value,
      comments: comments.value,
    }),
    (state) => {
      if (!annotator.value || !dataset.value) return;
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    },
    { deep: true }
  );

  return {
    dataset,
    annotator,
    items,
    responses,
    rationales,
    comments,
    loadFromLocalStorage,
  };
});
