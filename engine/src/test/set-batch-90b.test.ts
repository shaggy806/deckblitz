/**
 * Set walk batch 90, part b (2026-10-16): Fallout (PIP) and Ravnica: Clue Edition (CLU), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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
  hand,
  keywords,
  lands,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const energy = (game: Game, player: PlayerId = A): number => game.state.players[player].energy;
const makeToken = (game: Game, name: string, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
const firstToken = (game: Game, name: string, player: PlayerId = A): ObjectId => {
  const id = named(game, name, player).find((each) => game.state.objects[each].isToken === true);
  if (id === undefined) throw new Error(`no ${name}`);
  return id;
};

describe("Sierra, Nuka's Biggest Fan", () => {
  it("one quest counter and one Food per combat damage batch, and a sacrificed Food pumps by the quest counters", () => {
    const { game, a } = table();
    const sierra = spawn(game, "Sierra, Nuka's Biggest Fan");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [sierra, bears]);
    expect(counters(game, sierra, "quest")).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    lands(game, "Wastes", 2);
    pickTargets(a, bears);
    activate(game, firstToken(game, "Food Token"), 0);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("sacrificing an artifact that isn't a Food doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Sierra, Nuka's Biggest Fan");
    makeToken(game, "Clue Token");
    lands(game, "Wastes", 2);
    const seen = watchTargets(a);
    activate(game, firstToken(game, "Clue Token"), 0);
    expect(seen.asked).toBe(0);
  });
});

describe("Mister Gutsy", () => {
  it("grows on Aura and Equipment spells only, and dies into that many Junk tokens", () => {
    const { game } = table();
    const gutsy = spawn(game, "Mister Gutsy");
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Bonesplitter"));
    cast(game, toHand(game, "Rancor"), { targets: [ref(gutsy)] });
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, gutsy)).toBe(2);
    destroy(game, gutsy);
    expect(zone(game, gutsy)).toBe("graveyard");
    expect(tokensNamed(game, "Junk Token", A)).toBe(2);
  });
});

describe("Nick Valentine, Private Eye", () => {
  it("can be blocked only by artifact creatures", () => {
    const { game, a } = table();
    const nick = spawn(game, "Nick Valentine, Private Eye");
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    const offer = blockOffer(game, a, [nick]);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).not.toContain(nick);
    expect(offer.eligible.find((e) => e.blocker === thopter)?.canBlock ?? []).toContain(nick);
  });

  it("may investigate when it or another artifact creature you control dies, not for other creatures", () => {
    const { game, a } = table();
    const nick = spawn(game, "Nick Valentine, Private Eye");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, thopter);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    destroy(game, bears);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    destroy(game, nick);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });

  it("the investigate is optional", () => {
    const { game, a } = table();
    spawn(game, "Nick Valentine, Private Eye");
    const thopter = spawn(game, "Ornithopter");
    pickModes(a);
    destroy(game, thopter);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("Robobrain War Mind", () => {
  it("its power is the cards in your hand, its toughness stays 5", () => {
    const { game } = table();
    const robo = spawn(game, "Robobrain War Mind");
    const size = hand(game).length;
    expect(pt(game, robo)).toEqual({ power: size, toughness: 5 });
    toHand(game, "Wastes");
    expect(pt(game, robo)).toEqual({ power: size + 1, toughness: 5 });
  });

  it("enters with energy for each artifact creature you control, itself included", () => {
    const { game } = table();
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter", B);
    spawn(game, "Grizzly Bears");
    enter(game, "Robobrain War Mind");
    expect(energy(game)).toBe(2);
  });

  it("attacking, pays three energy to draw a card", () => {
    const { game, a } = table();
    const robo = spawn(game, "Robobrain War Mind");
    game.state.players[A].energy = 4;
    const size = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [robo]);
    expect(energy(game)).toBe(1);
    expect(hand(game).length).toBe(size + 1);
  });
});

describe("Commander Sofia Daguerre", () => {
  it("destroys up to one target legendary permanent, and its controller creates a Junk token", () => {
    const { game, a } = table();
    const isamaru = spawn(game, "Isamaru, Hound of Konda", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [isamaru]);
    enter(game, "Commander Sofia Daguerre");
    expect(seen.offered[0]).toContain(isamaru);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, isamaru)).toBe("graveyard");
    expect(tokensNamed(game, "Junk Token", B)).toBe(1);
    expect(tokensNamed(game, "Junk Token", A)).toBe(0);
  });

  it("with no target chosen, nobody gets a Junk token", () => {
    const { game, a } = table();
    spawn(game, "Isamaru, Hound of Konda", B);
    pickTargets(a, null);
    enter(game, "Commander Sofia Daguerre");
    expect(tokensNamed(game, "Junk Token")).toBe(0);
  });
});

describe("Elder Owyn Lyons", () => {
  it("returns an artifact card from your graveyard when it enters and when it dies", () => {
    const { game, a } = table();
    const thopter = toGraveyard(game, "Ornithopter");
    pickTargets(a, thopter);
    const owyn = enter(game, "Elder Owyn Lyons");
    expect(zone(game, thopter)).toBe("hand");
    const splitter = toGraveyard(game, "Bonesplitter");
    pickTargets(a, splitter);
    destroy(game, owyn);
    expect(zone(game, splitter)).toBe("hand");
  });

  it("gives its controller's artifacts ward {1}", () => {
    const { game, a } = table();
    spawn(game, "Elder Owyn Lyons", B);
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("battlefield");
  });

  it("an artifact's ward is paid with {1} more", () => {
    const { game, a } = table();
    spawn(game, "Elder Owyn Lyons", B);
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Mountain", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("graveyard");
  });

  it("isn't itself warded (it isn't an artifact)", () => {
    const { game } = table();
    const owyn = spawn(game, "Elder Owyn Lyons", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(owyn)] });
    expect(zone(game, owyn)).toBe("graveyard");
  });
});

describe("Butch DeLoria, Tunnel Snake", () => {
  it("puts a menace counter on another creature and makes it a Rogue for good", () => {
    const { game } = table();
    const butch = spawn(game, "Butch DeLoria, Tunnel Snake");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    expect(() => activate(game, butch, 0, { targets: [ref(butch)] })).toThrow();
    activate(game, butch, 0, { targets: [ref(bears)] });
    expect(counters(game, bears, "menace")).toBe(1);
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(subtypes(game, bears)).toContain("Rogue");
    game.advanceUntil((s) => s.turn.number === 3);
    expect(subtypes(game, bears)).toContain("Rogue");
  });

  it("attacking, gets +1/+1 for each other Rogue and/or Snake you control, a Rogue Snake once", () => {
    const { game, a } = table();
    const butch = spawn(game, "Butch DeLoria, Tunnel Snake");
    const bears = spawn(game, "Grizzly Bears");
    const cobra = spawn(game, "Narnam Cobra");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    activate(game, butch, 0, { targets: [ref(bears)] });
    activate(game, butch, 0, { targets: [ref(cobra)] });
    expect(subtypes(game, cobra)).toEqual(expect.arrayContaining(["Snake", "Rogue"]));
    attack(game, a, [butch]);
    expect(pt(game, butch)).toEqual({ power: 4, toughness: 4 });
  });
});
