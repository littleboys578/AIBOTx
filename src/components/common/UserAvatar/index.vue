<script setup lang='ts'>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
// import jwt from 'jsonwebtoken'
// import jwt from 'jsonwebtoken'
import { useUserStore } from '@/store'
import { isString } from '@/utils/is'
const userStore = useUserStore()
// tslint:disable-next-line:no-var-requires
const userInfo = computed(() => userStore.userInfo)
let email = '123'
import jwt_decode from 'jwt-decode'
const token = localStorage.getItem('jwt_token')
console.log(token)
if (token) {
const decodedToken = jwt_decode(token) as { email: string }
email = decodedToken.email
}
</script>

<template>
  <div class="flex items-center overflow-hidden">
    <!--    <div class="w-10 h-10 overflow-hidden rounded-full shrink-0"> -->
    <!--      <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0"> -->
    <!--        <NAvatar -->
    <!--          size="large" -->
    <!--          round -->
    <!--          :src="userInfo.avatar" -->
    <!--          :fallback-src="defaultAvatar" -->
    <!--        /> -->
    <!--      </template> -->
    <!--      <template v-else> -->
    <!--        <NAvatar size="large" round :src="defaultAvatar" /> -->
    <!--      </template> -->
    <!--    </div> -->
    <NAvatar
      :size="100"
      src="http://roger-markdown.oss-cn-beijing.aliyuncs.com/2023/04/08/16809413568716.jpg"
    />

    <div class="flex-1 min-w-0 ml-2">
      <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
        {{ email ?? 'ALL View AI' }}
      </h2>
      <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
        {{ '扫描加群' }}
      </h2>
      <p class="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap">
        <span
          v-if="isString(userInfo.description) && userInfo.description !== ''"
          v-html="userInfo.description"
        />
      </p>
    </div>
  </div>
</template>
