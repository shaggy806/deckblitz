/**
 * Set walk batch 78, part c (2026-10-15): Lorwyn Eclipsed (ECL), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
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
  watchTargets,
  zone,
} from "./harness.js";

/** A real token (`spawn` of a token's card isn't one). */
function makeToken(game: Game, name: string, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}

const MERFOLK_TOKEN = "Merfolk Token (Silvergill Mentor)";

describe("Chaos Spewer", () => {
  it("costs nothing more when its controller pays {2} as it enters", () => {
    const { game, a } = table();
    const wastes = lands(game, "Wastes", 2);
    pickModes(a, 0);
    const spewer = enter(game, "Chaos Spewer");
    expect(counters(game, spewer, "-1/-1")).toBe(0);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("blights 2 onto a creature of its controller's choice when they don't pay", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    const picked = pickPermanents(a, bears);
    const spewer = enter(game, "Chaos Spewer");
    expect(picked.offered).toEqual(expect.arrayContaining([bears, spewer]));
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, spewer, "-1/-1")).toBe(0);
  });

  it("blights when there's no mana to pay", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const spewer = enter(game, "Chaos Spewer");
    expect(counters(game, spewer, "-1/-1")).toBe(2);
    expect(pt(game, spewer)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Liminal Hold", () => {
  it("exiles an opponent's nonland permanent until it leaves, and gains 2 life", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [theirs]);
    const hold = enter(game, "Liminal Hold");
    expect(seen.offered[0]).not.toContain(hold);
    expect(zone(game, theirs)).toBe("exile");
    expect(life(game)).toBe(22);
    destroy(game, hold);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });

  it("can't take your own permanent, and gains the life with no target chosen", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [null]);
    enter(game, "Liminal Hold");
    expect(seen.offered[0] ?? []).not.toContain(mine);
    expect(zone(game, mine)).toBe("battlefield");
    expect(life(game)).toBe(22);
  });
});

describe("Silvergill Peddler", () => {
  it("draws a card, then discards a card, whenever it becomes tapped", () => {
    const { game } = table();
    const peddler = spawn(game, "Silvergill Peddler");
    toHand(game, "Grizzly Bears");
    const handBefore = hand(game).length;
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(peddler)]);
    settle(game);
    expect(hand(game)).toHaveLength(handBefore);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Thoughtweft Charge", () => {
  it("pumps +3/+3 and draws only once a creature entered under your control this turn", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Grizzly Bears", B);
    const handBefore = hand(game).length;
    cast(game, toHand(game, "Thoughtweft Charge"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(hand(game)).toHaveLength(handBefore);

    enter(game, "Grizzly Bears");
    cast(game, toHand(game, "Thoughtweft Charge"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
    expect(hand(game)).toHaveLength(handBefore + 1);
  });
});

describe("Eclipsed Merrow", () => {
  it("offers a Merfolk (a changeling too), Plains or Island card from the top four", () => {
    const { game, a } = table();
    const island = toLibrary(game, "Island");
    const changeling = toLibrary(game, "Chameleon Colossus");
    const bears = toLibrary(game, "Grizzly Bears");
    const merfolk = toLibrary(game, "Silvergill Mentor");
    const seen = pickFromZone(a, merfolk);
    enter(game, "Eclipsed Merrow");
    expect([...seen.offered].sort()).toEqual([island, changeling, merfolk].sort());
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, merfolk)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-3).sort()).toEqual([island, changeling, bears].sort());
  });
});

describe("Wanderwine Farewell", () => {
  it("returns two nonland permanents and makes a Merfolk for each while you control a Merfolk", () => {
    const { game } = table();
    lands(game, "Island", 7);
    spawn(game, "Silvergill Peddler");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Wanderwine Farewell"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
    expect(tokensNamed(game, MERFOLK_TOKEN, A)).toBe(2);
  });

  it("counts a returned token, and makes one per permanent actually returned", () => {
    const { game } = table();
    lands(game, "Island", 7);
    spawn(game, "Silvergill Peddler");
    const token = makeToken(game, "Soldier Token", B);
    cast(game, toHand(game, "Wanderwine Farewell"), { targets: [ref(token), null] });
    expect(game.state.objects[token]?.zone ?? "gone").not.toBe("battlefield");
    expect(tokensNamed(game, MERFOLK_TOKEN, A)).toBe(1);
  });

  it("makes no tokens without a Merfolk on the battlefield (the spell itself isn't one you control)", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Wanderwine Farewell"), { targets: [ref(bears), null] });
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, MERFOLK_TOKEN)).toBe(0);
  });
});

describe("Meanders Guide", () => {
  it("taps another Merfolk, and when it does returns a creature card with mana value 3 or less", () => {
    const { game, a } = table();
    const guide = spawn(game, "Meanders Guide");
    const mentor = spawn(game, "Silvergill Mentor");
    spawn(game, "Grizzly Bears");
    const bearsCard = toGraveyard(game, "Grizzly Bears");
    const peddlerCard = toGraveyard(game, "Silvergill Peddler");
    const gang = toGraveyard(game, "Gutsplitter Gang");
    const tapped = pickPermanents(a, mentor);
    const seen = watchTargets(a, () => [bearsCard]);
    attack(game, a, [guide]);
    expect(tapped.offered).toEqual([mentor]);
    expect(game.state.objects[mentor].tapped).toBe(true);
    expect([...seen.offered[0]].sort()).toEqual([bearsCard, peddlerCard].sort());
    expect(seen.offered[0]).not.toContain(gang);
    expect(zone(game, bearsCard)).toBe("battlefield");
    expect(zone(game, peddlerCard)).toBe("graveyard");
  });

  it("returns nothing, and targets nothing, when no Merfolk is tapped", () => {
    const { game, a } = table();
    const guide = spawn(game, "Meanders Guide");
    const mentor = spawn(game, "Silvergill Mentor");
    const bearsCard = toGraveyard(game, "Grizzly Bears");
    pickPermanents(a);
    const seen = watchTargets(a, () => [bearsCard]);
    attack(game, a, [guide]);
    expect(seen.asked).toBe(0);
    expect(game.state.objects[mentor].tapped).toBe(false);
    expect(zone(game, bearsCard)).toBe("graveyard");
  });
});

describe("Flaring Cinder", () => {
  it("may discard a card as it enters, and if it does draws one", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    const discard = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [discard];
    const handBefore = hand(game).length;
    enter(game, "Flaring Cinder");
    expect(asked).toBe(1);
    expect(zone(game, discard)).toBe("graveyard");
    expect(hand(game)).toHaveLength(handBefore);
  });

  it("rummages when you cast a spell with mana value 4 or greater, not less", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    lands(game, "Island", 3);
    lands(game, "Swamp", 5);
    spawn(game, "Flaring Cinder");
    cast(game, toHand(game, "Silvergill Peddler"));
    expect(asked).toBe(0);
    const graveyardBefore = graveyard(game).length;
    cast(game, toHand(game, "Gutsplitter Gang"));
    expect(asked).toBe(1);
    expect(graveyard(game)).toHaveLength(graveyardBefore + 1);
  });

  it("isn't offered with an empty hand", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: hand(game).length });
    settle(game);
    expect(hand(game)).toHaveLength(0);
    enter(game, "Flaring Cinder");
    expect(asked).toBe(0);
    expect(hand(game)).toHaveLength(0);
  });
});

describe("Riverguard's Reflexes", () => {
  it("gives +2/+2 and first strike, and untaps the creature", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Riverguard's Reflexes"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Gutsplitter Gang", () => {
  it("blights 2 at the beginning of your first main phase if you choose", () => {
    const { game, a } = table();
    const gang = spawn(game, "Gutsplitter Gang");
    pickModes(a, 0);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, gang, "-1/-1")).toBe(2);
    expect(life(game)).toBe(20);
    toStep(game, "postcombat-main");
    settle(game);
    expect(counters(game, gang, "-1/-1")).toBe(2);
  });

  it("loses 3 life if you don't", () => {
    const { game, a } = table();
    const gang = spawn(game, "Gutsplitter Gang");
    pickModes(a);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, gang, "-1/-1")).toBe(0);
    expect(life(game)).toBe(17);
  });

  it("loses 3 life when there's no creature left to blight", () => {
    const { game, a } = table();
    const gang = spawn(game, "Gutsplitter Gang");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toStep(game, "precombat-main");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(gang)]);
    settle(game);
    expect(asked).toBe(0);
    expect(life(game)).toBe(17);
  });
});

describe("Rimekin Recluse", () => {
  it("returns up to one other creature to its owner's hand", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [theirs]);
    const recluse = enter(game, "Rimekin Recluse");
    expect(seen.offered[0]).not.toContain(recluse);
    expect(zone(game, theirs)).toBe("hand");
    expect(hand(game, B)).toContain(theirs);
  });
});

describe("Thoughtweft Imbuer", () => {
  it("gives a creature attacking alone +X/+X for the Kithkin you control", () => {
    const { game, a } = table();
    spawn(game, "Thoughtweft Imbuer");
    spawn(game, "Wary Farmer");
    spawn(game, "Wary Farmer", B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(life(game, B)).toBe(16);
  });

  it("does nothing when two creatures attack", () => {
    const { game, a } = table();
    spawn(game, "Thoughtweft Imbuer");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    attack(game, a, [bears, other]);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Kulrath Zealot", () => {
  it("exiles the top card of your library as it enters, playable through your next turn", () => {
    const { game } = table();
    const mountain = toLibrary(game, "Mountain");
    enter(game, "Kulrath Zealot");
    expect(zone(game, mountain)).toBe("exile");
    toStep(game, "precombat-main");
    game.dispatch({ type: "play-land", player: A, card: mountain });
    settle(game);
    expect(zone(game, mountain)).toBe("battlefield");
  });

  it("has basic landcycling {1}{R}", () => {
    const { game } = table();
    const card = game.registry.get("Kulrath Zealot");
    expect(card.cycling).toEqual({ cost: "{1}{R}", search: { supertype: "basic", type: "land" } });
  });
});

describe("Wary Farmer", () => {
  it("surveils 1 at your end step only if another creature entered under your control this turn", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseScryFn = () => {
      asked += 1;
      return [];
    };
    enter(game, "Wary Farmer");
    enter(game, "Grizzly Bears", B);
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(0);

    nextTurn(game);
    toStep(game, "precombat-main");
    enter(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(1);
  });
});

describe("Gravelgill Scoundrel", () => {
  it("can't be blocked if it taps another untapped creature as it attacks", () => {
    const { game, a } = table();
    const scoundrel = spawn(game, "Gravelgill Scoundrel");
    const bears = spawn(game, "Grizzly Bears");
    const offered = pickPermanents(a, bears);
    attack(game, a, [scoundrel]);
    expect(offered.offered).toEqual([bears]);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[scoundrel].tapped).toBe(false);
    expect(keywords(game, scoundrel).has("unblockable")).toBe(true);
  });

  it("stays blockable if it taps nothing", () => {
    const { game, a } = table();
    const scoundrel = spawn(game, "Gravelgill Scoundrel");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    attack(game, a, [scoundrel]);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, scoundrel).has("unblockable")).toBe(false);
  });
});

describe("Wanderbrine Trapper", () => {
  it("taps itself, {1} and another creature to tap an opponent's creature", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const trapper = spawn(game, "Wanderbrine Trapper");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.dispatch({ type: "activate-ability", player: A, source: trapper, abilityIndex: 0, targets: [ref(theirs)], tap: [bears] });
    settle(game);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[trapper].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("can't be activated without another untapped creature", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const trapper = spawn(game, "Wanderbrine Trapper");
    const theirs = spawn(game, "Grizzly Bears", B);
    const why = game.canDispatch({
      type: "activate-ability",
      player: A,
      source: trapper,
      abilityIndex: 0,
      targets: [ref(theirs)],
    });
    expect(why).not.toBeNull();
  });
});

describe("Gallant Fowlknight", () => {
  it("gives your creatures +1/+0 and only your Kithkin creatures first strike", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const farmer = spawn(game, "Wary Farmer");
    const theirs = spawn(game, "Wary Farmer", B);
    const knight = enter(game, "Gallant Fowlknight");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(pt(game, farmer)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, farmer).has("first-strike")).toBe(true);
    expect(keywords(game, knight).has("first-strike")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, theirs).has("first-strike")).toBe(false);
  });
});

describe("Boulder Dash", () => {
  it("deals 2 damage to one target and 1 to another", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Boulder Dash"), { targets: [ref(theirs), ref(B)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });

  it("needs two different targets", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Boulder Dash"), { targets: [ref(theirs), ref(theirs)] })).toThrow();
  });
});

describe("Bristlebane Outrider", () => {
  it("gets +2/+0 once another creature entered under your control this turn", () => {
    const { game } = table();
    const outrider = enter(game, "Bristlebane Outrider");
    expect(pt(game, outrider)).toEqual({ power: 3, toughness: 5 });
    enter(game, "Grizzly Bears", B);
    expect(pt(game, outrider)).toEqual({ power: 3, toughness: 5 });
    enter(game, "Grizzly Bears");
    expect(pt(game, outrider)).toEqual({ power: 5, toughness: 5 });
    nextTurn(game);
    expect(pt(game, outrider)).toEqual({ power: 3, toughness: 5 });
  });

  it("can't be blocked by creatures with power 2 or less", () => {
    const { game, a } = table();
    const outrider = spawn(game, "Bristlebane Outrider");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [outrider]);
    const canBlock = (blocker: ObjectId): readonly ObjectId[] =>
      offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(bears)).not.toContain(outrider);
    expect(canBlock(giant)).toContain(outrider);
  });
});
