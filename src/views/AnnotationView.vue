<script setup>
import { ref, computed } from "vue";
import tasks from "@/data/tasks.json";
import { useRoute } from "vue-router";
import { shuffle } from "@/utils";
import NotificationComponent from "./NotificationComponent.vue";

// Examplhttp://localhost:5173/?dataset=cs-cl&annotator=foo
const route = useRoute();
const dataset = route.query.dataset;
const annotator = route.query.annotator;

const task = tasks.find((task) => {
  return task.dataset == dataset;
});
const items = ref(shuffle(task.items.slice(), annotator));
const responses = ref(Array(items.value.length).fill(null));
const comments = ref("");

const isComplete = computed(() => {
  return (
    responses.value.length === items.value.length &&
    responses.value.every((r) => r)
  );
});

const showBody = ref(true);
function toggleBody() {
  showBody.value = !showBody.value;
}

const genre = function () {
  switch (dataset) {
    case "pubmed-sample":
      return "a paper describing the results of a randomized controlled trial (RCT)";
    case "qmsum-generic":
      return "a meeting transcript (e.g., research group meetings)";
    case "cs-cl":
      return "a paper on Natural Language Processing (NLP)";
    case "astro-ph":
      return "a paper on astro physics";
  }
};

const responseData = computed(() => {
  return {
    dataset: dataset,
    annotator: annotator,
    comments: comments.value,
    items: items.value.map((item, index) => ({
      id: item.id,
      question: item.title,
      rating: responses.value[index],
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
</script>

<template>
  <div class="survey">
    <h1>Question Salience in Text Summarization</h1>
    <div class="introduction">
      <p>
        <span style="font-weight: bold">Task.</span> Imagine you are asked to
        summarize {{ genre() }} in about 200 words for a typical reader in this
        genre. What are some key questions you want the summary to answer? Here,
        your task is to rate the (relative) importance of a list of questions
        that could be answered in the summary.
      </p>
      <ul>
        <li>1 = Least important to be answered in the summary.</li>
        <li>10 = Most important to be answered in the summary.</li>
      </ul>
      <p>
        After completing the ratings, please submit the generated response.
        Thank you for participating!
      </p>
    </div>

    <div class="row">
      <h2>Questions</h2>
      <button @click="toggleBody" class="button-gray">
        {{ showBody ? "Hide examples" : "Show examples" }}
      </button>
    </div>

    <div v-for="(item, index) in items" :key="index" class="item-container">
      <div class="item-description">
        <p class="item-title">{{ item.title }}</p>
        <p v-if="showBody" class="item-body">{{ item.body }}</p>
      </div>

      <div class="item-rating">
        <label v-for="n in 10" :key="n">
          <input
            type="radio"
            :name="'question-' + index"
            :value="n"
            v-model="responses[index]"
          />
          {{ n }}
        </label>
      </div>
    </div>

    <textarea
      v-model="comments"
      name="Text1"
      placeholder="Any comments (optional)..."
    ></textarea>

    <div v-if="isComplete">
      <div class="row">
        <div>
          <h2>Response Data</h2>
          Thank you for participating! Please share the following data with us.
        </div>

        <div>
          <button @click="submitSurvey" :disabled="!isComplete">
            Copy to clipboard.
          </button>
          <NotificationComponent ref="notification" />
        </div>
      </div>
      <code class="response">{{ JSON.stringify(responseData, null, 2) }}</code>
    </div>
  </div>
</template>

<style>
textarea {
  width: 100%;
  max-width: 100%;
  min-height: 150px;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  font-family: "Arial", sans-serif;
  font-size: 16px;
  color: #333;
  outline: none;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  background-color: #fff;
}

.survey {
  max-width: 1000px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
}

.introduction {
  margin-bottom: 2em;
  background-color: rgb(228, 228, 228);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.item-container {
  margin-bottom: 20px;
  display: flex;
  gap: 5em;
  justify-content: space-between;
}

.item-description {
  flex: 70%;
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
  flex: 30%;
  justify-content: flex-end;
  gap: 10px;
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
  background-color: #ccc;
  cursor: not-allowed;
}

.button-gray {
  background-color: #ccc;
  color: white;
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
