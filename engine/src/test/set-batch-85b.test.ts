/**
 * Set walk batch 85, part b (2026-10-15): Foundations Jumpstart (J25), Duskmourn: House of Horror Commander (DSC) and Duskmourn: House of Horror (DSK), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

const faceDown = (game: Game): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined);

const playLand = (game: Game, name: string): ObjectId => {
  const land = toHand(game, name);
  game.dispatch({ type: "play-land", player: A, card: land });
  settle(game);
  return land;
};

/** Cast a Room's `door` (1 left, 2 right) from the hand. */
const castDoor = (game: Game, name: string, door: 1 | 2): ObjectId => {
  const room = toHand(game, name);
  game.dispatch({ type: "cast-spell", player: A, card: room, face: door, targets: [] });
  settle(game);
  return room;
};

/** Four card types in alice's graveyard: instant, creature, artifact, enchantment. */
const delirium = (game: Game): void => {
  for (const name of ["Lightning Bolt", "Grizzly Bears", "Sol Ring", "Glorious Anthem"]) toGraveyard(game, name);
};

describe("Etched Cornfield", () => {
  it("enters tapped unless a player — an opponent too — has 13 or less life", () => {
    const { game } = table();
    expect(tapped(game, playLand(game, "Etched Cornfield"))).toBe(true);
    game.state.players[B].life = 13;
    expect(tapped(game, playLand(game, "Etched Cornfield"))).toBe(false);
  });
});

describe("Fear of Lost Teeth", () => {
  it("dies: 1 damage to any target and you gain 1 life", () => {
    const { game, a } = table();
    const fear = spawn(game, "Fear of Lost Teeth");
    pickTargets(a, B);
    destroy(game, fear);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("Commune with Evil", () => {
  it("one of the top four into your hand, the rest into your graveyard, then 3 life", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const cards = ["Lightning Bolt", "Grizzly Bears", "Sol Ring", "Opt"].map((name) => toLibrary(game, name));
    pickFromZone(a, cards[1]);
    cast(game, toHand(game, "Commune with Evil"));
    expect(zone(game, cards[1])).toBe("hand");
    for (const id of [cards[0], cards[2], cards[3]]) expect(zone(game, id)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });
});

describe("Deluge of Doom", () => {
  it("all creatures get -X/-X, X the card types in your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    for (const name of ["Lightning Bolt", "Grizzly Bears", "Wastes"]) toGraveyard(game, name);
    // An opponent's graveyard doesn't count.
    toGraveyard(game, "Sol Ring", B);
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm");
    cast(game, toHand(game, "Deluge of Doom"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Broodspinner", () => {
  it("sacrificed, it makes a flying Insect per card type in your graveyard — itself counted", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Lightning Bolt");
    const spider = enter(game, "Broodspinner");
    activate(game, spider, 0);
    expect(zone(game, spider)).toBe("graveyard");
    // Land, instant and the sacrificed creature.
    expect(tokensNamed(game, "Insect Token (Infestation Sage)", A)).toBe(3);
  });
});

describe("Grand Entryway // Elegant Rotunda", () => {
  it("Grand Entryway makes a Glimmer; Elegant Rotunda counters up to two creatures", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const room = castDoor(game, "Grand Entryway // Elegant Rotunda", 1);
    expect(tokensNamed(game, "Glimmer Token", A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears, giant);
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(1);
  });
});

describe("Ticket Booth // Tunnel of Hate", () => {
  it("Ticket Booth manifests dread as it's unlocked", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    castDoor(game, "Ticket Booth // Tunnel of Hate", 1);
    expect(faceDown(game)).toHaveLength(1);
    expect(graveyard(game)).toHaveLength(1);
  });

  it("Tunnel of Hate: whenever you attack, target attacking creature gains double strike", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    castDoor(game, "Ticket Booth // Tunnel of Hate", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Painter's Studio // Defaced Gallery", () => {
  it("Painter's Studio exiles your top two, playable through your next turn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    castDoor(game, "Painter's Studio // Defaced Gallery", 1);
    const exiled = game.state.zones.shared.exile.filter((id) => game.state.objects[id].impulse !== undefined);
    expect(exiled).toHaveLength(2);
  });

  it("Defaced Gallery: whenever you attack, attacking creatures you control get +1/+0", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    castDoor(game, "Painter's Studio // Defaced Gallery", 2);
    const bears = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(pt(game, home)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Keys to the House", () => {
  it("{1}, {T}, sacrifice: a basic land card into your hand", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const forest = toLibrary(game, "Forest");
    const keys = spawn(game, "Keys to the House");
    pickFromZone(a, forest);
    activate(game, keys, 0);
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, keys)).toBe("graveyard");
  });

  it("{3}, {T}, sacrifice: unlocks a locked door of target Room you control", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const room = castDoor(game, "Grand Entryway // Elegant Rotunda", 1);
    lands(game, "Wastes", 3);
    const keys = spawn(game, "Keys to the House");
    const bears = spawn(game, "Grizzly Bears");
    // Lock Grand Entryway (mode 0) or unlock Elegant Rotunda (mode 1).
    pickModes(a, 1);
    pickTargets(a, bears, null);
    activate(game, keys, 1, { targets: [ref(room)] });
    expect(game.state.objects[room].doors).toEqual({ left: true, right: true });
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, keys)).toBe("graveyard");
  });
});

describe("Turn Inside Out", () => {
  it("+3/+0, and when that creature dies this turn, its caster manifests dread", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Turn Inside Out"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(faceDown(game)).toHaveLength(0);
    destroy(game, bears);
    const down = faceDown(game);
    expect(down).toHaveLength(1);
    expect(game.state.objects[down[0]].controller).toBe(A);
  });
});

describe("Wickerfolk Thresher", () => {
  it("delirium: a land on top may go onto the battlefield", () => {
    const { game, a } = table();
    delirium(game);
    const forest = toLibrary(game, "Forest");
    const thresher = spawn(game, "Wickerfolk Thresher");
    pickFromZone(a, forest);
    attack(game, a, [thresher]);
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("a card not put onto the battlefield goes to your hand; without delirium, nothing", () => {
    const { game, a } = table();
    delirium(game);
    const bears = toLibrary(game, "Grizzly Bears");
    const thresher = spawn(game, "Wickerfolk Thresher");
    attack(game, a, [thresher]);
    expect(zone(game, bears)).toBe("hand");

    const { game: game2, a: a2 } = table();
    toGraveyard(game2, "Lightning Bolt");
    toGraveyard(game2, "Grizzly Bears");
    toGraveyard(game2, "Sol Ring");
    const forest = toLibrary(game2, "Forest");
    const thresher2 = spawn(game2, "Wickerfolk Thresher");
    pickFromZone(a2, forest);
    attack(game2, a2, [thresher2]);
    expect(zone(game2, forest)).toBe("library");
  });
});

describe("Cursed Recording", () => {
  it("the seventh time counter is removed with the rest, and it deals 20 damage to you", () => {
    const { game, a } = table({ life: 40 });
    lands(game, "Mountain", 1);
    const recording = spawn(game, "Cursed Recording");
    game.state.objects[recording].counters.time = 5;
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, recording, "time")).toBe(6);
    expect(life(game, A)).toBe(40);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, recording, "time")).toBe(0);
    expect(life(game, A)).toBe(20);
  });

  it("{T}: the next instant or sorcery you cast this turn is copied — the copy isn't cast", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const recording = spawn(game, "Cursed Recording");
    activate(game, recording, 0);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    expect(counters(game, recording, "time")).toBe(1);
  });
});

describe("Glitch Interpreter", () => {
  it("with no face-down permanent, it returns to your hand and you manifest dread; with one, it stays", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const card = toHand(game, "Glitch Interpreter");
    cast(game, card);
    expect(zone(game, card)).toBe("hand");
    expect(faceDown(game)).toHaveLength(1);
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(faceDown(game)).toHaveLength(1);
  });

  it("whenever colorless creatures you control deal combat damage to a player, draw a card", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const card = toHand(game, "Glitch Interpreter");
    cast(game, card);
    // Cast again, it stays: its trigger is its own.
    cast(game, card);
    const [down] = faceDown(game);
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "precombat-main");
    const before = hand(game).length;
    // A colored attacker alone: no draw.
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before);
    toStep(game, "precombat-main");
    const after = hand(game).length;
    attack(game, a, [down]);
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(after + 1);
  });
});

describe("Ursine Monstrosity", () => {
  it("at the beginning of combat: mill one, must attack a random opponent, indestructible and +1/+1 per card type", () => {
    const { game } = table();
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears");
    const bear = spawn(game, "Ursine Monstrosity");
    toStep(game, "begin-combat");
    settle(game);
    // The milled Wastes makes three types: instant, creature, land.
    expect(graveyard(game)).toHaveLength(3);
    expect(game.state.objects[bear].mustAttackPlayer).toBe(B);
    expect(keywords(game, bear).has("indestructible")).toBe(true);
    expect(pt(game, bear)).toEqual({ power: 6, toughness: 6 });
    // Locked in: a card type added later doesn't grow it.
    toGraveyard(game, "Sol Ring");
    expect(pt(game, bear)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Convert to Slime", () => {
  it("destroys an artifact, a creature and an enchantment; delirium counts them, and the Ooze is their total mana value", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 3);
    toGraveyard(game, "Wastes");
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears");
    const anthem = spawn(game, "Glorious Anthem");
    cast(game, toHand(game, "Convert to Slime"), { targets: [ref(ring), ref(bears), ref(anthem)] });
    for (const id of [ring, bears, anthem]) expect(zone(game, id)).toBe("graveyard");
    const [ooze] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Ooze Token (Convert to Slime)");
    expect(ooze).toBeDefined();
    expect(pt(game, ooze)).toEqual({ power: 6, toughness: 6 });
  });

  it("an opponent's permanents don't make your delirium; up to one of each may be left out", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 3);
    toGraveyard(game, "Wastes");
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Convert to Slime"), { targets: [ref(ring), ref(bears), null] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Ooze Token (Convert to Slime)")).toBe(0);
  });
});

describe("Phenomenon Investigators", () => {
  it("Believe: a nontoken creature you control dying makes a 2/2 Horror; a token doesn't", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Believe";
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Phenomenon Investigators"));
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(tokensNamed(game, "Horror Token", A)).toBe(1);
    const [horror] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Horror Token");
    destroy(game, horror);
    expect(tokensNamed(game, "Horror Token", A)).toBe(0);
    // An opponent's creature: nothing.
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(tokensNamed(game, "Horror Token", A)).toBe(0);
  });

  it("Believe: it sees its own death (rule 603.10a)", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Believe";
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const investigators = toHand(game, "Phenomenon Investigators");
    cast(game, investigators);
    destroy(game, investigators);
    expect(tokensNamed(game, "Horror Token", A)).toBe(1);
  });

  it("Doubt: at your end step you may return a nonland permanent you own; if you do, draw", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Doubt";
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const investigators = toHand(game, "Phenomenon Investigators");
    cast(game, investigators);
    const ring = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Sol Ring", B);
    const seen = pickPermanents(a, ring);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(seen.offered).toContain(ring);
    expect(seen.offered).toContain(investigators);
    expect(seen.offered).not.toContain(theirs);
    expect(zone(game, ring)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
  });

  it("Doubt: declining returns nothing and draws nothing; no Believe trigger", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Doubt";
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Phenomenon Investigators"));
    pickPermanents(a);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Horror Token", A)).toBe(0);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);
  });
});
