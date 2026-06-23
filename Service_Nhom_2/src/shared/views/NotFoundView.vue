<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <v-icon size="120" color="grey-lighten-1" class="mb-6">mdi-map-marker-question</v-icon>
        <h1 class="text-h3 font-weight-bold text-grey-darken-2 mb-4">404</h1>
        <p class="text-h6 text-grey mb-8">Trang bạn tìm kiếm không tồn tại</p>
        <v-btn color="primary" size="large" to="/dashboard" prepend-icon="mdi-home">
          Về trang chủ
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
