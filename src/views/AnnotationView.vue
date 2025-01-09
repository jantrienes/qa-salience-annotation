<script setup>
import { ref, computed, onMounted } from "vue";
import { useSurveyStore } from "@/stores/SurveyStore.js";
import { useRoute } from "vue-router";
import { shuffle } from "@/utils";
import NotificationComponent from "./NotificationComponent.vue";
import tasks from "@/data/tasks.json";

const route = useRoute();
const store = useSurveyStore();

const dataset = route.query.dataset;
const annotator = route.query.annotator;

onMounted(() => {
  // Set dataset+annotator to compute storage key
  store.dataset = dataset;
  store.annotator = annotator;

  // Load data from local storage
  store.loadFromLocalStorage();

  // Initialize raw data if not already set
  if (!store.items.length) {
    const task = tasks.find((task) => task.dataset === dataset);
    store.items = shuffle(task.items.slice(), annotator);
    store.responses = Array(store.items.length).fill(null);
    store.rationales = Array(store.items.length).fill("");
  }
});

const isComplete = computed(() => {
  return (
    store.responses.length === store.items.length &&
    store.responses.every((r) => r !== null)
  );
});

const showIDs = ref(new Set());
function toggleBody(i) {
  showIDs.value.has(i) ? showIDs.value.delete(i) : showIDs.value.add(i);
}

const showingAll = ref(false);
function toggleAll() {
  if (!showingAll.value) {
    for (var i = 0; i <= store.items.length; i++) {
      showIDs.value.add(i);
    }
  } else {
    showIDs.value.clear();
  }

  showingAll.value = !showingAll.value;
}

const responseData = computed(() => {
  return {
    dataset: store.dataset,
    annotator: store.annotator,
    comments: store.comments,
    items: store.items.map((item, index) => ({
      id: item.id,
      question: item.title,
      rating: store.responses[index],
      rationale: store.rationales[index],
    })),
  };
});

const notification = ref();
function submitSurvey() {
  try {
    navigator.clipboard.writeText(JSON.stringify(responseData.value, null, 2));
    notification.value.showNotification();
  } catch (err) {
    alert("Could not copy response, please manually copy it. ");
    console.log(err);
  }
}

function genre() {
  switch (dataset) {
    case "pubmed-sample":
      return 'Imagine you are asked to <span style="font-weight: bold;">summarize a paper describing the results of a randomized controlled trial (RCT)</span> for a typical reader in this genre.';
    case "qmsum-generic":
      return 'Imagine you are asked to <span style="font-weight: bold;">summarize a meeting transcript (e.g., research group meetings)</span> for a typical reader in this genre.';
    case "cs-cl":
      return 'Imagine you are asked to <span style="font-weight: bold;">summarize the related work section of an Natural Language Processing (NLP) paper</span> for a typical reader in this genre.';
    case "astro-ph":
      return 'Imagine you are asked to <span style="font-weight: bold;">summarize the discussion section of an astro-physics paper</span> for a typical reader in this genre.';
  }
}
</script>

<template>
  <div class="survey">
    <h1>Question Salience in Text Summarization</h1>
    <div class="introduction">
      <p>
        <span style="font-weight: bold">Task. </span>
        <span v-html="genre()" /> What are some key questions you want the
        summary to answer? Here, your task is to rate the (relative) importance
        of a list of questions that could be answered in the summary.
      </p>
      <p style="margin-top: 0.5em">
        <span style="font-weight: bold">Rating scale.</span>
      </p>
      <ol>
        <li>
          Least important; I would exclude this information from a summary.
        </li>
        <li>
          Low importance; I would include this information if there is room.
        </li>
        <li>Medium importance; I would probably include this information.</li>
        <li>High importance; I would definitely include this information.</li>
        <li>
          Most important; One of the first questions to be answered in the
          summary.
        </li>
      </ol>
      <p style="margin-top: 0.5em">
        <span style="font-weight: bold">Submission.</span> After completing the
        ratings, please submit the generated data (json). Thank you for
        participating!
      </p>
    </div>

    <div class="row">
      <h2>Questions</h2>
      <button @click="toggleAll">
        {{ showingAll ? "Hide all examples" : "Show all examples" }}
      </button>
    </div>

    <div
      v-for="(item, index) in store.items"
      :key="index"
      class="item-container"
    >
      <div class="item-description">
        <!-- <p class="item-title"><a @click="toggleBody(index)">{{ item.title }}</a></p> -->
        <p class="item-title" @click="toggleBody(index)">{{ item.title }}</p>
        <p v-if="showIDs.has(index) | showAll" class="item-body">
          {{ item.body }}
        </p>
      </div>

      <div class="item-rating">
        <label v-for="n in 5" :key="n">
          <input
            type="radio"
            :name="'question-' + index"
            :value="n"
            v-model="store.responses[index]"
          />
          {{ n }}
        </label>
        <textarea
          style="margin-left: 1.5em"
          v-model="store.rationales[index]"
          placeholder="Rationale"
        ></textarea>
      </div>
    </div>

    <textarea
      v-model="store.comments"
      name="Text1"
      placeholder="Any comments (optional)..."
    ></textarea>

    <div class="row">
      <div>
        <h2>Response Data</h2>
        {{
          isComplete
            ? "Thank you for participating! Please share the following data with us."
            : "Please complete all ratings before submission."
        }}
      </div>

      <div>
        <button @click="submitSurvey" :disabled="!isComplete">
          Copy to clipboard.
        </button>
        <NotificationComponent ref="notification" />
      </div>
    </div>
    <code v-if="isComplete" class="response">{{
      JSON.stringify(responseData, null, 2)
    }}</code>
  </div>
</template>

<style>
textarea {
  width: 100%;
  max-width: 100%;
  min-height: 50px;
  padding: 12px 15px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background-mute);
  font-family: "Arial", sans-serif;
  font-size: 16px;
  color: var(--color-text);
  outline: none;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.item-rating textarea {
  height: 50px;
  min-height: 50px;
  width: 50%;
  min-width: 50%;
  max-width: 50%;
  padding: 8px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background-mute);
  font-family: "Arial", sans-serif;
  font-size: 12px;
  color: var(--color-text);
  outline: none;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.survey {
  max-width: 1100px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
}

.introduction {
  margin-bottom: 2em;
  background-color: var(--color-background-mute);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.item-container {
  margin-bottom: 20px;
  display: flex;
  gap: 3em;
  justify-content: space-between;
}

.item-description {
  flex: 60%;
}

.item-body {
  font-weight: lighter;
  white-space: pre-wrap;
}

.item-title {
  font-weight: bold;
  font-size: 1.1em;
}

.item-rating {
  display: flex;
  margin-left: auto;
  flex: 40%;
  justify-content: flex-end;
  gap: 10px;
  align-items: flex-start;
  flex-wrap: wrap;
}

label {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 0pt !important;
  margin-top: 0pt !important;
}

button:disabled {
  background-color: var(--color-background-mute);
  cursor: not-allowed;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1em;
}

.response {
  display: block;
  white-space: pre-wrap;
  font-size: 0.8em;
  line-height: 12px !important;
}
</style>
