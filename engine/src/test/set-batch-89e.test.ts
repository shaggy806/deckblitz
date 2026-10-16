/**
 * Set walk batch 89, part e (2026-10-16): The Big Score (BIG), Outlaws of Thunder Junction Commander (OTC) and Outlaws of Thunder Junction (OTJ), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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
  named,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const MERCENARY = "Mercenary Token";
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const tokensOf = (game: Game, name: string, player: PlayerId): ObjectId[] =>
  game.battlefield.filter(
    (id) =>
      game.state.objects[id].cardName === name &&
      game.state.objects[id].isToken === true &&
      game.state.objects[id].controller === player,
  );
const makeToken = (game: Game, token: string, player: PlayerId): ObjectId => {
  game.debugApplyEffect(player, { kind: "create-token", token, count: 1 }, []);
  const made = tokensOf(game, token, player);
  return made[made.length - 1];
};
/** On to this turn's end step, its beginning-of-end-step triggers resolved. */
const toEndStep = (game: Game): void => {
  toStep(game, "end");
  settle(game);
};

describe("Throw from the Saddle", () => {
  it("a non-Mount gets +1/+1 until end of turn, then deals damage equal to its power", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Throw from the Saddle"), { targets: [ref(bears), ref(theirs)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(counters(game, bears)).toBe(0);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("a Mount gets a +1/+1 counter instead (and not the pump too)", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const mustang = spawn(game, "Brightfield Mustang");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Throw from the Saddle"), { targets: [ref(mustang), ref(angel)] });
    expect(counters(game, mustang)).toBe(1);
    expect(pt(game, mustang)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, angel)).toBe("graveyard");
  });

  it("needs a creature you don't control as its second target", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    expect(() =>
      cast(game, toHand(game, "Throw from the Saddle"), { targets: [ref(bears), ref(other)] }),
    ).toThrow();
  });
});

describe("Unfortunate Accident", () => {
  it("both modes: destroys a creature and makes a Mercenary", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Unfortunate Accident"), { modes: [0, 1], targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(tokensNamed(game, MERCENARY, A)).toBe(1);
  });

  it("the token mode alone costs {1}{B}", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const angel = spawn(game, "Serra Angel", B);
    expect(() =>
      cast(game, toHand(game, "Unfortunate Accident"), { modes: [0], targets: [ref(angel)] }),
    ).toThrow();
    cast(game, toHand(game, "Unfortunate Accident"), { modes: [1] });
    expect(zone(game, angel)).toBe("battlefield");
    const [mercenary] = tokensOf(game, MERCENARY, A);
    expect(pt(game, mercenary)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Iron-Fist Pulverizer", () => {
  it("your second spell each turn deals 2 to target opponent — a spell cast before it entered counts", () => {
    const { game } = table();
    cast(game, toHand(game, "Ornithopter"));
    spawn(game, "Iron-Fist Pulverizer");
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Ornithopter"));
    expect(life(game, B)).toBe(18);
    // The third doesn't.
    cast(game, toHand(game, "Ornithopter"));
    expect(life(game, B)).toBe(18);
  });

  it("scries 1", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Grizzly Bears");
    a.chooseScryFn = (_view, cards) => cards;
    spawn(game, "Iron-Fist Pulverizer");
    cast(game, toHand(game, "Ornithopter"));
    cast(game, toHand(game, "Ornithopter"));
    // Scried to the bottom: the next draw isn't it.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    expect(zone(game, top)).toBe("library");
  });
});

describe("Bristlepack Sentry", () => {
  it("can attack despite defender while you control a creature with power 4 or greater", () => {
    const { game } = table();
    const sentry = spawn(game, "Bristlepack Sentry");
    expect(whyCannotAttack(game.state, game.registry, A, sentry, B)).toMatch(/defender/);
    spawn(game, "Serra Angel", B);
    expect(whyCannotAttack(game.state, game.registry, A, sentry, B)).toMatch(/defender/);
    spawn(game, "Serra Angel");
    expect(whyCannotAttack(game.state, game.registry, A, sentry, B)).toBeNull();
  });

  it("its own power counts (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const sentry = spawn(game, "Bristlepack Sentry");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(sentry)] });
    expect(whyCannotAttack(game.state, game.registry, A, sentry, B)).toBeNull();
  });
});

describe("Frontier Seeker", () => {
  it("offers a Mount creature card or a Plains card from the top five", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const plains = toLibrary(game, "Plains");
    const mustang = toLibrary(game, "Brightfield Mustang");
    const seen = pickFromZone(a, mustang);
    enter(game, "Frontier Seeker");
    expect(seen.offered).toContain(mustang);
    expect(seen.offered).toContain(plains);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, mustang)).toBe("hand");
    expect(zone(game, plains)).toBe("library");
  });
});

describe("Scalestorm Summoner", () => {
  it("makes a 3/1 Dinosaur only if you control a creature with power 4 or greater as it resolves", () => {
    const { game, a } = table();
    const summoner = spawn(game, "Scalestorm Summoner");
    attack(game, a, [summoner]);
    expect(tokensNamed(game, "3/1 Dinosaur Token", A)).toBe(0);

    const second = table();
    const summoner2 = spawn(second.game, "Scalestorm Summoner");
    spawn(second.game, "Serra Angel");
    attack(second.game, second.a, [summoner2]);
    const [dino] = tokensOf(second.game, "3/1 Dinosaur Token", A);
    expect(pt(second.game, dino)).toEqual({ power: 3, toughness: 1 });
  });

  it("counts itself", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const summoner = spawn(game, "Scalestorm Summoner");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(summoner)] });
    attack(game, a, [summoner]);
    expect(tokensNamed(game, "3/1 Dinosaur Token", A)).toBe(1);
  });
});

describe("Stoic Sphinx", () => {
  it("has hexproof only while you haven't cast a spell this turn", () => {
    const { game } = table();
    const sphinx = spawn(game, "Stoic Sphinx");
    expect(keywords(game, sphinx).has("hexproof")).toBe(true);
    cast(game, toHand(game, "Ornithopter"));
    expect(keywords(game, sphinx).has("hexproof")).toBe(false);
    expect(keywords(game, sphinx).has("flying")).toBe(true);
    // A new turn: no spell cast yet.
    nextTurn(game);
    expect(keywords(game, sphinx).has("hexproof")).toBe(true);
  });
});

describe("Trick Shot", () => {
  it("6 to a creature and 2 to another creature token", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const angel = spawn(game, "Serra Angel", B);
    const token = makeToken(game, MERCENARY, B);
    cast(game, toHand(game, "Trick Shot"), { targets: [ref(angel), ref(token)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(game.state.objects[token] === undefined || game.state.objects[token].zone !== "battlefield").toBe(true);
  });

  it("the token can't be the first target too; the second target is optional", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const token = makeToken(game, MERCENARY, B);
    const shot = toHand(game, "Trick Shot");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: shot, targets: [ref(token), ref(token)] })).not.toBeNull();
    const angel = spawn(game, "Serra Angel", B);
    cast(game, shot, { targets: [ref(angel), null] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(tokensNamed(game, MERCENARY, B)).toBe(1);
  });
});

describe("Jem Lightfoote, Sky Explorer", () => {
  it("draws at your end step if you haven't cast a spell from your hand", () => {
    const { game } = table();
    spawn(game, "Jem Lightfoote, Sky Explorer");
    const before = hand(game).length;
    toEndStep(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("not after a spell from your hand", () => {
    const { game } = table();
    spawn(game, "Jem Lightfoote, Sky Explorer");
    cast(game, toHand(game, "Ornithopter"));
    const before = hand(game).length;
    toEndStep(game);
    expect(hand(game).length).toBe(before);
  });

  it("a spell cast from elsewhere (flashback) doesn't stop it", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Jem Lightfoote, Sky Explorer");
    const before = hand(game).length;
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    expect(hand(game).length).toBe(before + 1);
    toEndStep(game);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Failed Fording", () => {
  it("bounces a nonland permanent; surveils 1 only if you control a Desert", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    a.chooseScryFn = (_view, cards) => cards;
    const bears = spawn(game, "Grizzly Bears", B);
    const before = graveyard(game).length;
    cast(game, toHand(game, "Failed Fording"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    // Only Failed Fording itself.
    expect(graveyard(game).length).toBe(before + 1);

    spawn(game, "Conduit Pylons");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Failed Fording"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("hand");
    expect(graveyard(game).length).toBe(before + 3);
  });
});

describe("Lassoed by the Law", () => {
  it("exiles a nonland permanent until it leaves, and makes a Mercenary", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const lasso = enter(game, "Lassoed by the Law");
    expect(zone(game, angel)).toBe("exile");
    expect(tokensNamed(game, MERCENARY, A)).toBe(1);
    destroy(game, lasso);
    expect(named(game, "Serra Angel", B)).toHaveLength(1);
  });
});

describe("Sterling Supplier", () => {
  it("puts a +1/+1 counter on another creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const supplier = enter(game, "Sterling Supplier");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, supplier)).toBe(0);
    expect(keywords(game, supplier).has("flying")).toBe(true);
  });
});

describe("Wrangler of the Damned", () => {
  it("makes a 2/2 flying Spirit at your end step if you haven't cast a spell from your hand", () => {
    const { game } = table();
    spawn(game, "Wrangler of the Damned");
    toEndStep(game);
    const [spirit] = tokensOf(game, "Spirit Token (Phantom Interference)", A);
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, spirit).has("flying")).toBe(true);
  });

  it("not after a spell from your hand", () => {
    const { game } = table();
    spawn(game, "Wrangler of the Damned");
    cast(game, toHand(game, "Ornithopter"));
    toEndStep(game);
    expect(tokensNamed(game, "Spirit Token (Phantom Interference)", A)).toBe(0);
  });
});

describe("Desert's Due", () => {
  it("-2/-2, and another -1/-1 for each Desert you control", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Conduit Pylons", 1);
    const bighorn = spawn(game, "Bridled Bighorn", B);
    cast(game, toHand(game, "Desert's Due"), { targets: [ref(bighorn)] });
    expect(pt(game, bighorn)).toEqual({ power: 0, toughness: 1 });
  });
});

describe("Wanted Griffin", () => {
  it("leaves a Mercenary when it dies", () => {
    const { game } = table();
    const griffin = spawn(game, "Wanted Griffin");
    destroy(game, griffin);
    expect(tokensNamed(game, MERCENARY, A)).toBe(1);
  });
});

describe("Sterling Keykeeper", () => {
  it("taps a non-Mount creature, never a Mount", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const keykeeper = spawn(game, "Sterling Keykeeper");
    const mustang = spawn(game, "Brightfield Mustang", B);
    expect(() => activate(game, keykeeper, 0, { targets: [ref(mustang)] })).toThrow();
    const angel = spawn(game, "Serra Angel", B);
    activate(game, keykeeper, 0, { targets: [ref(angel)] });
    expect(isTapped(game, angel)).toBe(true);
    expect(isTapped(game, keykeeper)).toBe(true);
  });
});

describe("Emergent Haunting", () => {
  it("becomes a 3/3 flying Spirit creature at your end step, for good", () => {
    const { game } = table();
    const haunting = spawn(game, "Emergent Haunting");
    toEndStep(game);
    expect(types(game, haunting)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    expect(subtypes(game, haunting)).toContain("Spirit");
    expect(pt(game, haunting)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, haunting).has("flying")).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(types(game, haunting)).toContain("creature");
  });

  it("not after a spell from your hand", () => {
    const { game } = table();
    const haunting = spawn(game, "Emergent Haunting");
    cast(game, toHand(game, "Ornithopter"));
    toEndStep(game);
    expect(types(game, haunting)).not.toContain("creature");
  });

  it("{2}{U}: surveil 1", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    a.chooseScryFn = (_view, cards) => cards;
    const haunting = spawn(game, "Emergent Haunting");
    const before = graveyard(game).length;
    activate(game, haunting);
    expect(graveyard(game).length).toBe(before + 1);
  });
});

describe("Prosperity Tycoon", () => {
  it("enters with a Mercenary; {2}, sacrifice a token: indestructible and tapped", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const tycoon = enter(game, "Prosperity Tycoon");
    const [mercenary] = tokensOf(game, MERCENARY, A);
    const bears = spawn(game, "Grizzly Bears");
    // Only a token pays.
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: tycoon, abilityIndex: 0, targets: [], sacrifice: bears }),
    ).not.toBeNull();
    game.dispatch({ type: "activate-ability", player: A, source: tycoon, abilityIndex: 0, targets: [], sacrifice: mercenary });
    settle(game);
    expect(tokensNamed(game, MERCENARY, A)).toBe(0);
    expect(keywords(game, tycoon).has("indestructible")).toBe(true);
    expect(isTapped(game, tycoon)).toBe(true);
    destroy(game, tycoon);
    expect(zone(game, tycoon)).toBe("battlefield");
  });
});

describe("Peerless Ropemaster", () => {
  it("returns up to one tapped creature", () => {
    const { game, a } = table();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, tapped);
    enter(game, "Peerless Ropemaster");
    expect(zone(game, tapped)).toBe("hand");
  });

  it("may return nothing, and an untapped creature isn't a target", () => {
    const { game, a } = table();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Serra Angel", B);
    const seen = watchTargets(a);
    enter(game, "Peerless Ropemaster");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(tapped);
    expect(seen.offered[0]).not.toContain(untapped);
    expect(zone(game, tapped)).toBe("battlefield");
  });
});

describe("Inventive Wingsmith", () => {
  it("gets one flying counter at your end step if you haven't cast a spell from your hand", () => {
    const { game } = table();
    const smith = spawn(game, "Inventive Wingsmith");
    toEndStep(game);
    expect(counters(game, smith, "flying")).toBe(1);
    expect(keywords(game, smith).has("flying")).toBe(true);
    nextTurn(game);
    nextTurn(game);
    toEndStep(game);
    expect(counters(game, smith, "flying")).toBe(1);
  });

  it("not after a spell from your hand", () => {
    const { game } = table();
    const smith = spawn(game, "Inventive Wingsmith");
    cast(game, toHand(game, "Ornithopter"));
    toEndStep(game);
    expect(counters(game, smith, "flying")).toBe(0);
  });
});
