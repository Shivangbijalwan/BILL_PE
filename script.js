  window.addEventListener("load", async function () {
    await Clerk.load();

    // If user is signed in
    if (Clerk.user) {
  window.location.href = "dashboard.html";
}

    if (Clerk.user) {
      document.getElementById("auth-area").innerHTML = `
        <div class="flex items-center space-x-4">
          <img src="${Clerk.user.imageUrl}" alt="User Avatar" class="w-8 h-8 rounded-full" />
          <span class="font-semibold text-green-900">${Clerk.user.fullName || Clerk.user.username}</span>
          <button id="signOut" class="bg-stone-600 text-white px-3 py-1 rounded">Sign Out</button>
        </div>
      `;
      document.getElementById("signOut").addEventListener("click", () => Clerk.signOut());
    } else {
      document.getElementById("auth-area").innerHTML = `
        <button id="signIn" class="bg-green-900 text-white px-4 py-2 rounded-md">Sign In</button>
        <button id="signUp" class="border-2 border-green-900 text-green-900 px-4 py-2 rounded-md">Sign Up</button>
      `;
      document.getElementById("signIn").addEventListener("click", () => Clerk.openSignIn());
      document.getElementById("signUp").addEventListener("click", () => Clerk.openSignUp());
    }
  });
