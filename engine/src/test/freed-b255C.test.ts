/**
 * B255, group C: cards freed by the switch, piles, hand-exile, chosen-player
 * and per-player-count families. One test per card that's more than a stat line.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  blockOffer,
  cast,
  controller,
  counters,
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
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const CAT = "1/1 Green Cat Token";

/** On the battlefield, its as-enters question answered, untapped. */
function blackGate(game: Game): ObjectId {
  const gate = spawn(game, "The Black Gate", A);
  settle(game);
  game.state.objects[gate].tapped = false;
  return gate;
}

describe("The Black Gate", () => {
  it("binds the player with the most life as it resolves, and only that player's creatures", () => {
    const { game, a } = table({ players: 3 });
    game.state.players[B].life = 25;
    const gate = blackGate(game);
    lands(game, "Swamp", 2);
    const attacker = spawn(game, "Grizzly Bears", A);
    const bobs = spawn(game, "Grizzly Bears", B);
    activate(game, gate, 1, { targets: [ref(attacker)] });
    // The life totals changing later doesn't change who was chosen (the ruling).
    game.state.players[B].life = 1;
    const later = spawn(game, "Hill Giant", B);
    // A second attacker, so that Bob is asked at all.
    const free = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, a, [attacker, free], B);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(eligible(bobs)).toEqual([free]);
    expect(eligible(later)).toEqual([free]);
  });

  it("leaves other players' creatures free to block", () => {
    const { game, a } = table({ players: 3 });
    game.state.players[B].life = 25;
    const gate = blackGate(game);
    lands(game, "Swamp", 2);
    const attacker = spawn(game, "Grizzly Bears", A);
    const carols = spawn(game, "Grizzly Bears", C);
    activate(game, gate, 1, { targets: [ref(attacker)] });
    const offer = blockOffer(game, a, [attacker], C);
    expect(offer.eligible.find((e) => e.blocker === carols)?.canBlock).toEqual([attacker]);
  });

  it("asks among those tied for most life, the activator included, and no one else", () => {
    const { game, a } = table({ players: 3 });
    game.state.players[B].life = 10;
    const gate = blackGate(game);
    lands(game, "Swamp", 2);
    const attacker = spawn(game, "Grizzly Bears", A);
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [texts.findIndex((t) => t.toLowerCase().includes("carol"))];
    };
    activate(game, gate, 1, { targets: [ref(attacker)] });
    expect(offered).toHaveLength(2);
    expect(offered.some((t) => t.toLowerCase().includes("bob"))).toBe(false);
    const carols = spawn(game, "Grizzly Bears", C);
    const free = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, a, [attacker, free], C);
    expect(offer.eligible.find((e) => e.blocker === carols)?.canBlock).toEqual([free]);
  });
});

describe("Sewer Nemesis", () => {
  it("counts the chosen player's graveyard, and mills them as they cast a spell", () => {
    const { game, a, b } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => B;
    toGraveyard(game, "Wastes", B);
    toGraveyard(game, "Wastes", B);
    toGraveyard(game, "Wastes", A);
    lands(game, "Swamp", 4);
    const nemesis = toHand(game, "Sewer Nemesis");
    cast(game, nemesis);
    expect(game.state.objects[nemesis].chosenPlayer).toBe(B);
    expect(pt(game, nemesis)).toEqual({ power: 2, toughness: 2 });

    // Alice casting mills nobody; Bob casting mills Bob.
    lands(game, "Swamp", 2, A);
    const before = graveyard(game, B).length;
    lands(game, "Swamp", 2, A);
    cast(game, toHand(game, "Duress"), { targets: [ref(C)] });
    expect(graveyard(game, B).length).toBe(before);
    lands(game, "Mountain", 1, B);
    b.chooseTargetsFn = () => [ref(A)];
    toStep(game, "precombat-main", B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    // Shock itself and the milled card.
    expect(graveyard(game, B).length).toBe(before + 2);
    expect(pt(game, nemesis)).toEqual({ power: before + 2, toughness: before + 2 });
  });

  it("dies once the chosen player has left the game", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => B;
    toGraveyard(game, "Wastes", B);
    lands(game, "Swamp", 4);
    const nemesis = toHand(game, "Sewer Nemesis");
    cast(game, nemesis);
    expect(zone(game, nemesis)).toBe("battlefield");
    game.concede(B);
    settle(game);
    expect(zone(game, nemesis)).toBe("graveyard");
  });
});

describe("Sakashima's Will", () => {
  it("offers one mode with no commander", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 4);
    expect(() => cast(game, toHand(game, "Sakashima's Will"), { modes: [0, 1], targets: [ref(B)] })).toThrow();
  });

  it("with a commander, both: the opponent gives up the creature they choose, and it can be the one copied", () => {
    const { game, a, b } = table({ players: 3 });
    const commander = spawn(game, "Grizzly Bears", A);
    game.state.objects[commander].isCommander = true;
    const bobsGiant = spawn(game, "Hill Giant", B);
    const bobsOther = spawn(game, "Grizzly Bears", B);
    pickPermanents(b, bobsGiant);
    const seen = pickPermanents(a, bobsGiant);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Sakashima's Will"), { modes: [0, 1], targets: [ref(B)] });
    expect(controller(game, bobsGiant)).toBe(A);
    expect(controller(game, bobsOther)).toBe(B);
    expect(seen.offered).toContain(bobsGiant);
    // The commander becomes a Hill Giant until end of turn; Bob's creature doesn't.
    expect(pt(game, commander)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bobsOther)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bobsGiant)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Inversion Behemoth", () => {
  it("switches each of any number of targets, until end of turn", () => {
    const { game, a } = table();
    const behemoth = spawn(game, "Inversion Behemoth", A);
    const bears = spawn(game, "Hill Giant", A);
    pickTargets(a, behemoth, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, behemoth)).toEqual({ power: 9, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    toStep(game, "precombat-main", B);
    expect(pt(game, behemoth)).toEqual({ power: 2, toughness: 9 });
  });
});

describe("Sphinx of Clear Skies", () => {
  it("reveals X cards before the opponent is chosen, X the basic land types", () => {
    const { game, a, c } = table({ players: 3 });
    const sphinx = spawn(game, "Sphinx of Clear Skies", A);
    spawn(game, "Island", A);
    spawn(game, "Island", A);
    spawn(game, "Swamp", A);
    const top = [toLibrary(game, "Hill Giant"), toLibrary(game, "Grizzly Bears"), toLibrary(game, "Wastes")];
    let revealedAsAsked: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      revealedAsAsked = [...game.state.revealedThisTurn];
      return [texts.findIndex((t) => t.toLowerCase().includes("carol"))];
    };
    const [hill, grizzly] = top;
    const wastes = top[2];
    c.separatePilesFn = (_view, offer) => {
      expect(offer.objects).toHaveLength(2);
      return [[wastes], [grizzly]];
    };
    a.choosePileFn = () => 1;
    const before = hand(game, A).length;
    a.declareAttackersFn = () => [{ attacker: sphinx, defender: B }];
    toStep(game, "postcombat-main");
    settle(game);
    expect(revealedAsAsked).toEqual(expect.arrayContaining([wastes, grizzly]));
    expect(hand(game, A).length).toBe(before + 1);
    expect(zone(game, grizzly)).toBe("hand");
    expect(zone(game, wastes)).toBe("graveyard");
    expect(zone(game, hill)).toBe("library");
    expect(life(game, B)).toBe(15);
  });
});

describe("Sygg's Command", () => {
  it("is two modes: lifelink for one player's creatures and a tap with a stun counter", () => {
    const { game } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    lands(game, "Wastes", 3);
    spawn(game, "Plains", A);
    spawn(game, "Island", A);
    cast(game, toHand(game, "Sygg's Command"), { modes: [1, 3], targets: [ref(B), ref(carols)] });
    expect(keywords(game, bobs).has("lifelink")).toBe(true);
    expect(keywords(game, carols).has("lifelink")).toBe(false);
    expect(game.state.objects[carols].tapped).toBe(true);
    expect(counters(game, carols, "stun")).toBe(1);
  });

  it("copies a Merfolk you control, and draws for the target player", () => {
    const { game } = table({ players: 3 });
    const merfolk = spawn(game, "Coral Merfolk", A);
    lands(game, "Wastes", 1);
    spawn(game, "Plains", A);
    spawn(game, "Island", A);
    const before = hand(game, C).length;
    cast(game, toHand(game, "Sygg's Command"), { modes: [0, 2], targets: [ref(merfolk), ref(C)] });
    expect(hand(game, C).length).toBe(before + 1);
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Coral Merfolk")).toHaveLength(2);
  });
});

describe("Savage Alliance", () => {
  it("all three modes cost {1} more for each beyond the first, and each reads its own target", () => {
    const { game } = table({ players: 3 });
    const mine = spawn(game, "Hill Giant", A);
    const bobs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    lands(game, "Mountain", 4);
    const notEnough = toHand(game, "Savage Alliance");
    expect(() => cast(game, notEnough, { modes: [0, 1, 2], targets: [ref(A), ref(bobs), ref(B)] })).toThrow();
    spawn(game, "Mountain", A);
    cast(game, notEnough, { modes: [0, 1, 2], targets: [ref(A), ref(bobs), ref(B)] });
    expect(keywords(game, mine).has("trample")).toBe(true);
    expect(keywords(game, bobs).has("trample")).toBe(false);
    // 2 + 1 on the Giant of the targeted opponent (the ruling): dead at 3.
    expect(zone(game, bobs)).toBe("graveyard");
    expect(game.state.objects[carols].damageMarked).toBe(0);
    expect(game.state.objects[mine].damageMarked).toBe(0);
  });
});

describe("Mindleech Ghoul", () => {
  it("exploiting a creature has each opponent exile a card of their choice", () => {
    const { game, a, b, c } = table({ players: 3 });
    const fodder = spawn(game, "Grizzly Bears", A);
    const bobKept = toHand(game, "Hill Giant", B);
    const bobLost = toHand(game, "Grizzly Bears", B);
    const carolLost = toHand(game, "Grizzly Bears", C);
    pickFromZone(b, bobLost);
    pickFromZone(c, carolLost);
    pickModes(a, 0);
    pickPermanents(a, fodder);
    enter(game, "Mindleech Ghoul");
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, bobLost)).toBe("exile");
    expect(zone(game, bobKept)).toBe("hand");
    expect(zone(game, carolLost)).toBe("exile");
  });

  it("does nothing without the exploit", () => {
    const { game, a } = table({ players: 2 });
    pickModes(a);
    const before = hand(game, B).length;
    enter(game, "Mindleech Ghoul");
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Waiting in the Weeds", () => {
  it("each player's Cats are their own untapped Forests'", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 3, A);
    spawn(game, "Forest", B);
    spawn(game, "Forest", B);
    spawn(game, "Forest", B, { tapped: true });
    spawn(game, "Mountain", C);
    spawn(game, "Forest", C, { tapped: true });
    cast(game, toHand(game, "Waiting in the Weeds"));
    // Alice's three tapped to cast it.
    expect(tokensNamed(game, CAT, A)).toBe(0);
    expect(tokensNamed(game, CAT, B)).toBe(2);
    expect(tokensNamed(game, CAT, C)).toBe(0);
  });
});

describe("Death Match", () => {
  it("the entering creature's controller chooses the target and whether to do it", () => {
    const { game, a, b } = table({ players: 3 });
    spawn(game, "Death Match", A);
    const alices = spawn(game, "Hill Giant", A);
    let alicesAsked = 0;
    a.chooseTargetsFn = () => {
      alicesAsked += 1;
      return [ref(alices)];
    };
    b.chooseTargetsFn = () => [ref(alices)];
    pickModes(b, 0);
    enter(game, "Grizzly Bears", B);
    expect(alicesAsked).toBe(0);
    expect(zone(game, alices)).toBe("graveyard");
  });

  it("that controller may decline, as it resolves", () => {
    const { game, b } = table({ players: 3 });
    spawn(game, "Death Match", A);
    const alices = spawn(game, "Hill Giant", A);
    b.chooseTargetsFn = () => [ref(alices)];
    pickModes(b);
    enter(game, "Grizzly Bears", B);
    expect(zone(game, alices)).toBe("battlefield");
    expect(pt(game, alices)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Stadium Vendors", () => {
  it("the chosen player adds two mana of a color they choose", () => {
    const { game, a, c } = table({ players: 3 });
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((t) => t.toLowerCase().includes("carol"))];
    let carolAsked: readonly string[] = [];
    c.chooseModesFn = (_view, _min, _max, texts) => {
      carolAsked = texts;
      return [texts.findIndex((t) => t.includes("{G}"))];
    };
    enter(game, "Stadium Vendors", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(carolAsked).toHaveLength(5);
    expect(game.state.players[C].manaPool.map((u) => u.type)).toEqual(["G", "G"]);
    expect(game.state.players[A].manaPool).toEqual([]);
  });
});

describe("Burning of Xinye", () => {
  it("each player chooses their own four, others' lands stay, and every creature is dealt 4", () => {
    const { game, a, b } = table({ players: 3 });
    const mine = lands(game, "Mountain", 6, A);
    const bobs = lands(game, "Swamp", 5, B);
    const carols = lands(game, "Swamp", 5, C);
    const giant = spawn(game, "Hill Giant", C);
    const wurm = spawn(game, "Craw Wurm", B);
    // Six tapped to cast it; a land is still a land to destroy.
    const asked = pickPermanents(a, ...mine.slice(0, 4));
    const bobAsked = pickPermanents(b, ...bobs.slice(1));
    cast(game, toHand(game, "Burning of Xinye"), { targets: [ref(B)] });
    expect(asked.offered).toHaveLength(6);
    expect(bobAsked.offered).toHaveLength(5);
    expect(mine.map((id) => zone(game, id)).filter((z) => z === "graveyard")).toHaveLength(4);
    expect(zone(game, bobs[0])).toBe("battlefield");
    expect(bobs.slice(1).every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(carols.every((id) => zone(game, id) === "battlefield")).toBe(true);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("with fewer than four, all of them; an indestructible land can't be chosen", () => {
    const { game, a, b } = table({ players: 2 });
    lands(game, "Mountain", 6, A);
    const bobs = lands(game, "Swamp", 3, B);
    const darksteel = spawn(game, "Darksteel Citadel", B);
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 4);
    const seen = pickPermanents(b, ...bobs);
    cast(game, toHand(game, "Burning of Xinye"), { targets: [ref(B)] });
    expect(seen.offered).not.toContain(darksteel);
    expect(bobs.every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(zone(game, darksteel)).toBe("battlefield");
  });
});

describe("Skyshroud War Beast", () => {
  it("is as big as the chosen opponent's nonbasic lands", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => C;
    spawn(game, "Ancient Tomb", C);
    spawn(game, "Ancient Tomb", C);
    spawn(game, "Swamp", C);
    spawn(game, "Ancient Tomb", B);
    spawn(game, "Ancient Tomb", A);
    lands(game, "Forest", 2);
    const beast = toHand(game, "Skyshroud War Beast");
    cast(game, beast);
    expect(pt(game, beast)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Ancient Tomb", C);
    expect(pt(game, beast)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Pick the Brain", () => {
  const delirium = (game: ReturnType<typeof table>["game"]): void => {
    for (const name of ["Grizzly Bears", "Shock", "Duress", "Wastes"]) toGraveyard(game, name);
  };

  it("without delirium exiles only the chosen card", () => {
    const { game, a } = table();
    const chosen = toHand(game, "Hill Giant", B);
    const twin = toHand(game, "Hill Giant", B);
    pickFromZone(a, chosen);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Pick the Brain"), { targets: [ref(B)] });
    expect(zone(game, chosen)).toBe("exile");
    expect(zone(game, twin)).toBe("hand");
  });

  it("with delirium exiles that name from their graveyard, hand and library", () => {
    const { game, a } = table();
    delirium(game);
    const chosen = toHand(game, "Hill Giant", B);
    const inHand = toHand(game, "Hill Giant", B);
    const inGrave = toGraveyard(game, "Hill Giant", B);
    const inLibrary = toLibrary(game, "Hill Giant", B);
    const other = toHand(game, "Grizzly Bears", B);
    let picks = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      picks += 1;
      return picks === 1 ? [chosen] : eligible;
    };
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Pick the Brain"), { targets: [ref(B)] });
    for (const id of [chosen, inHand, inGrave, inLibrary]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, other)).toBe("hand");
  });

  it("with no nonland card to exile, delirium's search finds nothing", () => {
    const { game } = table();
    delirium(game);
    const before = toExile(game, "Wastes");
    const library = game.state.zones.perPlayer[B].library.length;
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Pick the Brain"), { targets: [ref(B)] });
    expect(zone(game, before)).toBe("exile");
    expect(game.state.zones.perPlayer[B].library.length).toBe(library);
    expect(hand(game, B).every((id) => zone(game, id) === "hand")).toBe(true);
  });
});
