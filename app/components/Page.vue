<template>
	<div id="main-view" class="container-fluid my-3">
		<navbar />
		<router-view class="mt-2" />

		<modal ref="disconnectedModal">
			<template slot="header">Disconnected</template>

			<p>Disconnected from server. Reloading page...</p>
		</modal>
	</div>
</template>
