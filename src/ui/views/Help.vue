<template>
  <main class="p-4">
    <div class="flex items-center mb-2">
      <router-link to="/" class="p-2 leading-none font-semibold bg-gray-200 hover:bg-gray-300 rounded hover:text-blue-800 text-gray-800"> ◂ Back</router-link>
      <h2 class="font-semibold text-2xl flex-1 text-center px-4">How To Use</h2>
      <span></span>
    </div>
    <img src="https://cdn.day4.now.sh/figma-graphql-data-fill/explanation.png" class="my-4 border w-full object-contain object-center" />
    <div class="text-gray-900">
      <h3 class="font-semibold text-xl mt-2 mb-1">Paths</h3>
      <p>Rename your elements to what you want to fill them with eg. "Written by {% author.name %}"</p>
      <p>The value between the "{%" and the "%}" is an object path that will be applied to the result of your graphql query</p>
      <h3 class="font-semibold text-xl mt-2 mb-1">Array</h3>
      <p>Array values can also be accessed eg. "{% data.posts[0].title %}" will select the title from the first post</p>
      <h3 class="font-semibold text-xl mt-2 mb-1">Collections</h3>
      <p>Specify the path to an array containing the items you wish to use before generating to automatically duplicate the selected element</p>
      <p>Value paths should be relative to the item and not root eg. "{% title %}" is correct but not "{% data.posts.title %}"</p>
    </div>

    <div class="mt-6 p-4 text-center text-purple-900">
      <p>Created by <a class="text-purple-600" href="https://twitter.com/GLamusse" target="_blank">Gerard Lamusse</a> @ <a class="text-purple-600" href="https://day4.agency">DAY4</a></p>
    </div>
  </main>
</template>