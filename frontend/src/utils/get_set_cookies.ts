export function SetCookie(user:string){
	const temp = new Date();
	temp.setTime(temp.getTime() + (24 * 60 * 60 * 1000));
	const expires = "expires=" + temp.toUTCString();

	document.cookie = "user" + "=" + user + "; " + expires + "; path=/";
}

export function GetCookie(){
	const cookies = document.cookie.split('; ');
	for (const cookie of cookies) {
		if(cookie.indexOf("user=")==0){
			return cookie.substring(5)
		}
	}
	return null;
}