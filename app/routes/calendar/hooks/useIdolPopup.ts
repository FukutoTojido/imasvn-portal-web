import { useRef, useState } from "react";
import type { CharacterData, RefList } from "../types";

export default function useIdolPopup() {
	const [showPopup, setShowPopup] = useState(false);
	const [idolInfo, setIdolInfo] = useState<CharacterData | undefined>();
	const cardRefList = useRef<RefList>({
		card: null,
		avatar: null,
		character: null,
		name: null,
		description: null,
	});
	const popupRefList = useRef<RefList>({
		card: null,
		avatar: null,
		character: null,
		name: null,
		description: null,
	});

	return {
		showPopup,
		setShowPopup,
		idolInfo,
		setIdolInfo,
		cardRefList,
		popupRefList,
	};
}
