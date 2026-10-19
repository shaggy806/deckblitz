/**
 * Commander Legends: Battle for Baldur's Gate, group a. One test (or two) per
 * card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import { goadersOf } from "../goad.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
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
  named,
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
  watchTargets,
  zone,
} from "./harness.js";

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const commander = (game: Game, name: string, player = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].isCommander = true;
  return id;
};

const castable = (game: Game, card: ObjectId, extra: Partial<Extract<Action, { type: "cast-spell" }>> = {}): boolean =>
  game.canDispatch({ type: "cast-spell", player: A, card, targets: [], ...extra }) === null;

describe("Renari, Merchant of Marvels", () => {
  it("lets you cast Dragon and artifact spells at instant speed, but not other spells", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Renari, Merchant of Marvels");
    lands(game, "Island", 6);
    const dragon = toHand(game, "Oceanus Dragon");
    const relic = toHand(game, "Darksteel Relic");
    const bears = toHand(game, "Grizzly Bears");
    expect(castable(game, bears)).toBe(false);
    expect(castable(game, relic)).toBe(true);
    expect(castable(game, dragon)).toBe(true);
  });

  it("without Renari, neither is castable in the upkeep", () => {
    const { game } = table({ step: "upkeep" });
    lands(game, "Island", 6);
    expect(castable(game, toHand(game, "Darksteel Relic"))).toBe(false);
  });
});

describe("Coronation of Chaos", () => {
  it("up to three target creatures can't block this turn and are goaded", () => {
    const { game, a } = table();
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Hill Giant", B);
    const free = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Coronation of Chaos"), { targets: [ref(x), ref(y), null] });
    expect(goadersOf(game.state, game.registry, x)).toEqual([A]);
    expect(goadersOf(game.state, game.registry, y)).toEqual([A]);
    expect(goadersOf(game.state, game.registry, free)).toEqual([]);
    const offer = blockOffer(game, a, [attacker]);
    expect(canBlock(offer, x)).toEqual([]);
    expect(canBlock(offer, y)).toEqual([]);
    expect(canBlock(offer, free)).toEqual([attacker]);
  });
});

describe("Cloakwood Hermit", () => {
  it("your commander makes two tapped Squirrels at your end step after a creature card hit your graveyard", () => {
    const { game } = table();
    spawn(game, "Cloakwood Hermit");
    commander(game, "Hill Giant");
    destroy(game, spawn(game, "Grizzly Bears"));
    toStep(game, "end");
    settle(game);
    const squirrels = named(game, "Squirrel Token", A);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
    expect(squirrels.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("does nothing when no creature card went to your graveyard this turn", () => {
    const { game } = table();
    spawn(game, "Cloakwood Hermit");
    commander(game, "Hill Giant");
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Squirrel Token")).toBe(0);
  });

  it("a creature that isn't a commander doesn't have the ability", () => {
    const { game } = table();
    spawn(game, "Cloakwood Hermit");
    spawn(game, "Hill Giant");
    destroy(game, spawn(game, "Grizzly Bears"));
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Squirrel Token")).toBe(0);
  });
});

describe("Nimbleclaw Adept", () => {
  it("untaps two other target permanents, once each turn, as a sorcery", () => {
    const { game } = table();
    const adept = spawn(game, "Nimbleclaw Adept");
    const x = spawn(game, "Grizzly Bears", A, { tapped: true });
    const y = spawn(game, "Island", A, { tapped: true });
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: adept, abilityIndex: 0, targets: [ref(adept), ref(x)] }),
    ).not.toBeNull();
    activate(game, adept, 0, { targets: [ref(x), ref(y)] });
    expect(game.state.objects[x].tapped).toBe(false);
    expect(game.state.objects[y].tapped).toBe(false);
    game.state.objects[adept].tapped = false;
    game.state.objects[x].tapped = true;
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: adept, abilityIndex: 0, targets: [ref(x), ref(y)] }),
    ).not.toBeNull();
  });

  it("can't be activated outside a main phase", () => {
    const { game } = table({ step: "upkeep" });
    const adept = spawn(game, "Nimbleclaw Adept");
    const x = spawn(game, "Grizzly Bears", A, { tapped: true });
    const y = spawn(game, "Island", A, { tapped: true });
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: adept, abilityIndex: 0, targets: [ref(x), ref(y)] }),
    ).not.toBeNull();
  });
});

describe("Recruitment Drive", () => {
  it("makes the tokens of the row the d20 lands on", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 8; seed++) {
      const { game } = table({ seed });
      lands(game, "Plains", 3);
      cast(game, toHand(game, "Recruitment Drive"));
      const roll = game.state.lastRoll?.total ?? 0;
      expect(roll).toBeGreaterThanOrEqual(1);
      const soldiers = tokensNamed(game, "Soldier Token", A);
      const knights = tokensNamed(game, "2/2 White Knight Token", A);
      if (roll <= 9) {
        expect([soldiers, knights]).toEqual([2, 0]);
        seen.add("low");
      } else if (roll <= 19) {
        expect([soldiers, knights]).toEqual([0, 2]);
        seen.add("mid");
      } else {
        expect([soldiers, knights]).toEqual([0, 3]);
      }
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("Young Blue Dragon // Sand Augury", () => {
  it("Sand Augury scries 1, draws, and goes on an adventure; the flying Dragon is cast from exile", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Grizzly Bears");
    lands(game, "Island", 7);
    const card = toHand(game, "Young Blue Dragon");
    pickFromZone(a);
    cast(game, card, { face: 1 });
    expect(hand(game)).toContain(top);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].onAdventure).toBe(true);
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
    expect(keywords(game, card).has("flying")).toBe(true);
    expect(pt(game, card)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Alora, Merry Thief", () => {
  it("whenever you attack, an attacking creature can't be blocked and returns to hand at the next end step", () => {
    const { game, a } = table();
    const alora = spawn(game, "Alora, Merry Thief");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    attack(game, a, [alora, bears]);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    expect(keywords(game, alora).has("unblockable")).toBe(false);
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, alora)).toBe("battlefield");
  });

  it("offers only attacking creatures", () => {
    const { game, a } = table();
    const alora = spawn(game, "Alora, Merry Thief");
    const home = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a);
    attack(game, a, [alora, bears]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(alora);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(home);
  });
});

describe("Overwhelming Encounter", () => {
  it("gives vigilance and trample, then the d20 row", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 8; seed++) {
      const { game } = table({ seed });
      const bears = spawn(game, "Grizzly Bears");
      const theirs = spawn(game, "Grizzly Bears", B);
      lands(game, "Forest", 5);
      cast(game, toHand(game, "Overwhelming Encounter"));
      expect(keywords(game, bears).has("vigilance")).toBe(true);
      expect(keywords(game, bears).has("trample")).toBe(true);
      expect(keywords(game, theirs).has("trample")).toBe(false);
      const roll = game.state.lastRoll?.total ?? 0;
      if (roll <= 9) {
        expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
        expect(counters(game, bears)).toBe(0);
        seen.add("low");
      } else if (roll <= 19) {
        expect(counters(game, bears)).toBe(2);
        seen.add("mid");
      } else {
        expect(counters(game, bears)).toBe(4);
      }
      expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("Clan Crafter", () => {
  it("your commander can pay {2} and sacrifice an artifact for a +1/+1 counter and a card", () => {
    const { game } = table();
    spawn(game, "Clan Crafter");
    const giant = commander(game, "Hill Giant");
    const relic = spawn(game, "Darksteel Relic");
    lands(game, "Island", 2);
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: giant, abilityIndex: 0, targets: [], sacrifice: relic });
    settle(game);
    expect(zone(game, relic)).toBe("graveyard");
    expect(counters(game, giant)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });

  it("a creature that isn't a commander has no such ability", () => {
    const { game } = table();
    spawn(game, "Clan Crafter");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Darksteel Relic");
    lands(game, "Island", 2);
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === giant)).toBe(false);
  });
});

describe("Lantern of Revealing", () => {
  it("may put a land from the top onto the battlefield tapped", () => {
    const { game, a } = table();
    const lantern = spawn(game, "Lantern of Revealing");
    lands(game, "Wastes", 4);
    const forest = toLibrary(game, "Forest");
    const seen = pickFromZone(a, forest);
    activate(game, lantern, 1);
    expect(seen.offered).toEqual([forest]);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("a nonland card may go to the bottom", () => {
    const { game, a } = table();
    const lantern = spawn(game, "Lantern of Revealing");
    lands(game, "Wastes", 4);
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(bears) ? [bears] : []);
    activate(game, lantern, 1);
    expect(zone(game, bears)).toBe("library");
    expect(library(game).at(-1)).toBe(bears);
  });

  it("taps for one mana of any color", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const elves = toHand(game, "Llanowar Elves");
    expect(castable(game, elves)).toBe(false);
    spawn(game, "Lantern of Revealing");
    expect(castable(game, elves)).toBe(true);
  });
});

describe("Rescuer Chwinga", () => {
  it("may return another permanent you control to its owner's hand", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const seen = pickPermanents(a, bears);
    const chwinga = enter(game, "Rescuer Chwinga");
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(chwinga);
    expect(zone(game, bears)).toBe("hand");
    expect(keywords(game, chwinga).has("flash")).toBe(true);
  });
});

describe("Cloakwood Swarmkeeper", () => {
  it("gets one counter for one batch of tokens, none for a nontoken", () => {
    const { game } = table();
    const keeper = spawn(game, "Cloakwood Swarmkeeper");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    expect(counters(game, keeper)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(counters(game, keeper)).toBe(1);
    enter(game, "Squirrel Token", B);
    expect(counters(game, keeper)).toBe(1);
  });
});

describe("Gray Harbor Merfolk", () => {
  it("gets +2/+0 while you control a commander creature, not a noncreature one", () => {
    const { game } = table();
    const merfolk = spawn(game, "Gray Harbor Merfolk");
    expect(keywords(game, merfolk).has("unblockable")).toBe(true);
    expect(pt(game, merfolk)).toEqual({ power: 0, toughness: 3 });
    commander(game, "Cloakwood Hermit");
    expect(pt(game, merfolk)).toEqual({ power: 0, toughness: 3 });
    commander(game, "Grizzly Bears", B);
    expect(pt(game, merfolk)).toEqual({ power: 0, toughness: 3 });
    commander(game, "Grizzly Bears");
    expect(pt(game, merfolk)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Winter Eladrin", () => {
  it("returns up to one other target creature to its owner's hand", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [theirs]);
    const eladrin = enter(game, "Winter Eladrin");
    expect(seen.offered[0]).not.toContain(eladrin);
    expect(zone(game, theirs)).toBe("hand");
  });
});

describe("Steadfast Unicorn", () => {
  it("pumps your creatures and gives vigilance, only during your turn", () => {
    const { game } = table();
    const unicorn = spawn(game, "Steadfast Unicorn");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 8);
    activate(game, unicorn);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, unicorn)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "upkeep", B);
    game.state.priority.holder = A;
    expect(game.canDispatch({ type: "activate-ability", player: A, source: unicorn, abilityIndex: 0, targets: [] })).not.toBeNull();
  });
});

describe("Gray Slaad // Entropic Decay", () => {
  it("has menace and deathtouch only with four or more creature cards in your graveyard", () => {
    const { game } = table();
    const slaad = spawn(game, "Gray Slaad");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Island");
    toGraveyard(game, "Grizzly Bears", B);
    expect(keywords(game, slaad).has("deathtouch")).toBe(false);
    toGraveyard(game, "Hill Giant");
    expect(keywords(game, slaad).has("deathtouch")).toBe(true);
    expect(keywords(game, slaad).has("menace")).toBe(true);
  });

  it("Entropic Decay mills four and goes on an adventure", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const card = toHand(game, "Gray Slaad");
    const before = graveyard(game).length;
    cast(game, card, { face: 1 });
    expect(graveyard(game).length).toBe(before + 4);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].onAdventure).toBe(true);
  });
});

describe("Sea Hag // Aquatic Ingress", () => {
  it("Sea Hag gives creatures your opponents control -4/-0 until end of turn", () => {
    const { game } = table();
    const theirs = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    const hag = enter(game, "Sea Hag");
    expect(pt(game, theirs)).toEqual({ power: -1, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, hag)).toEqual({ power: 3, toughness: 5 });
  });

  it("Aquatic Ingress: up to two target creatures get +1/+0 and can't be blocked", () => {
    const { game } = table();
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Hill Giant");
    lands(game, "Island", 3);
    const card = toHand(game, "Sea Hag");
    cast(game, card, { face: 1, targets: [ref(x), ref(y)] });
    expect(pt(game, x)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, y)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, x).has("unblockable")).toBe(true);
    expect(keywords(game, y).has("unblockable")).toBe(true);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Oceanus Dragon", () => {
  it("taps and goads target creature an opponent controls", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    enter(game, "Oceanus Dragon");
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(goadersOf(game.state, game.registry, theirs)).toEqual([A]);
    expect(goadersOf(game.state, game.registry, other)).toEqual([]);
  });
});

describe("Flaming Fist Officer", () => {
  it("grows whenever another creature you control leaves the battlefield", () => {
    const { game } = table();
    const officer = spawn(game, "Flaming Fist Officer");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, officer)).toBe(1);
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(giant)]);
    settle(game);
    expect(counters(game, officer)).toBe(2);
    destroy(game, spawn(game, "Grizzly Bears", B));
    destroy(game, spawn(game, "Darksteel Relic"));
    expect(counters(game, officer)).toBe(2);
  });
});

describe("Shameless Charlatan", () => {
  it("your commander becomes a copy of another target creature, and keeps the ability (the ruling)", () => {
    const { game } = table();
    spawn(game, "Shameless Charlatan");
    const bears = commander(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 6);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: bears, abilityIndex: 0, targets: [ref(bears)] }),
    ).not.toBeNull();
    activate(game, bears, 0, { targets: [ref(giant)] });
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[bears].isCommander).toBe(true);
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === bears)).toBe(true);
  });
});

describe("Carefree Swinemaster", () => {
  it("may pay {1}{G} for a 2/2 Boar that's tapped and attacking", () => {
    const { game, a } = table();
    const swine = spawn(game, "Carefree Swinemaster");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    attack(game, a, [swine]);
    const boars = named(game, "Boar Token", A);
    expect(boars).toHaveLength(1);
    expect(game.state.players[B].life).toBe(20 - 1 - 2);
  });

  it("declining makes nothing", () => {
    const { game, a } = table();
    const swine = spawn(game, "Carefree Swinemaster");
    lands(game, "Forest", 2);
    pickModes(a);
    attack(game, a, [swine]);
    expect(tokensNamed(game, "Boar Token")).toBe(0);
  });
});

describe("Bane's Invoker", () => {
  it("{8}: up to two target creatures each get +2/+2 and gain flying", () => {
    const { game } = table();
    const invoker = spawn(game, "Bane's Invoker");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 8);
    activate(game, invoker, 0, { targets: [ref(bears), ref(invoker)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, invoker)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, invoker).has("flying")).toBe(true);
  });
});
