/**
 * The set walk, batch 68, part c (2026-10-12): Duskmourn and Bloomburrow.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
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
  watchTargets,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);

const playLand = (game: Game, name: string): ObjectId => {
  const card = toHand(game, name);
  game.dispatch({ type: "play-land", player: A, card });
  settle(game);
  return card;
};

describe("Glassworks // Shattered Yard", () => {
  it("Glassworks deals 4 to an opponent's creature as it's unlocked; Shattered Yard pings each opponent at your end step", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 8);
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Hill Giant");
    const seen = watchTargets(a, () => [giant]);
    const room = toHand(game, "Glassworks // Shattered Yard");
    game.dispatch({ type: "cast-spell", player: A, card: room, face: 1, targets: [] });
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([giant, other].sort());
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    // Locked, the end step does nothing.
    toStep(game, "end");
    settle(game);
    expect([life(game, B), life(game, C)]).toEqual([20, 20]);
    toStep(game, "precombat-main");
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    toStep(game, "end");
    settle(game);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 19, 19]);
  });
});

describe("Nashi, Searcher in the Dark", () => {
  it("mills that many; taking a legendary card means no counter", () => {
    const { game, a } = table();
    const nashi = spawn(game, "Nashi, Searcher in the Dark");
    const pacifism = toLibrary(game, "Pacifism");
    const isamaru = toLibrary(game, "Isamaru, Hound of Konda");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, cards) => {
      offered = cards;
      return [isamaru];
    };
    pickModes(a, 0);
    attack(game, a, [nashi]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect([...offered].sort()).toEqual([pacifism, isamaru].sort());
    expect(zone(game, isamaru)).toBe("hand");
    expect(zone(game, pacifism)).toBe("graveyard");
    expect(counters(game, nashi)).toBe(0);
  });

  it("with nothing put into your hand — declined, or no legendary or enchantment card milled — the counter goes on", () => {
    const { game, a } = table();
    const nashi = spawn(game, "Nashi, Searcher in the Dark");
    toLibrary(game, "Pacifism");
    toLibrary(game, "Grizzly Bears");
    pickModes(a);
    const before = hand(game).length;
    attack(game, a, [nashi]);
    settle(game);
    expect(counters(game, nashi)).toBe(1);
    expect(hand(game).length).toBe(before);

    // Next turn: two Wastes milled, nothing to take — asked nothing, counter on.
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toStep(game, "precombat-main");
    attack(game, a, [nashi]);
    settle(game);
    expect(asked).toBe(0);
    expect(counters(game, nashi)).toBe(2);
  });
});

describe("Let's Play a Game", () => {
  it("is one mode without delirium, and any number with it", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const goblin = spawn(game, "Raging Goblin", B);
    const first = toHand(game, "Let's Play a Game");
    expect(() => cast(game, first, { modes: [0, 2] })).toThrow();
    cast(game, first, { modes: [2] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    expect(zone(game, goblin)).toBe("battlefield");

    // Delirium: creature, land, artifact, sorcery (this one's already there).
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Sol Ring");
    const bHand = hand(game, B).length;
    cast(game, toHand(game, "Let's Play a Game"), { modes: [0, 1, 2] });
    expect(zone(game, goblin)).toBe("graveyard");
    expect(hand(game, B).length).toBe(bHand - 2);
    expect(life(game, B)).toBe(14);
  });
});

describe("Twist Reality and Break Down the Door", () => {
  it("Twist Reality's second mode manifests dread", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const giant = toLibrary(game, "Hill Giant");
    const bolt = toLibrary(game, "Lightning Bolt");
    a.chooseFromZoneFn = () => [giant];
    cast(game, toHand(game, "Twist Reality"), { modes: [1] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].faceDown).toBeDefined();
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("Break Down the Door exiles an artifact or an enchantment, by mode", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const ring = spawn(game, "Sol Ring", B);
    const anthem = spawn(game, "Glorious Anthem", B);
    cast(game, toHand(game, "Break Down the Door"), { modes: [1], targets: [ref(anthem)] });
    expect(zone(game, anthem)).toBe("exile");
    expect(zone(game, ring)).toBe("battlefield");
    // The artifact mode can't take the enchantment.
    const second = toHand(game, "Break Down the Door");
    const ward = spawn(game, "Pacifism", B);
    expect(() => cast(game, second, { modes: [0], targets: [ref(ward)] })).toThrow();
  });
});

describe("Bleeding Woods and Lakeside Shack", () => {
  it("enter tapped unless any player — you or an opponent — is at 13 or less", () => {
    const { game } = table({ players: 3 });
    expect(game.state.objects[playLand(game, "Bleeding Woods")].tapped).toBe(true);
    game.state.players[C].life = 13;
    expect(game.state.objects[playLand(game, "Bleeding Woods")].tapped).toBe(false);
    game.state.players[C].life = 14;
    game.state.players[A].life = 13;
    expect(game.state.objects[playLand(game, "Lakeside Shack")].tapped).toBe(false);
    game.state.players[A].life = 14;
    expect(game.state.objects[playLand(game, "Lakeside Shack")].tapped).toBe(true);
  });
});

describe("Optimistic Scavenger", () => {
  it("counters a target creature when an enchantment enters under you and when you fully unlock a Room", () => {
    const { game, a } = table();
    lands(game, "Swamp", 8);
    spawn(game, "Optimistic Scavenger");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    // An opponent's enchantment doesn't count.
    enter(game, "Glorious Anthem", B, { settle: false });
    expect(game.state.pendingTriggers.length + game.state.zones.shared.stack.length).toBe(0);
    enter(game, "Glorious Anthem");
    expect(counters(game, bears)).toBe(1);
    // Casting Unholy Annex is an enchantment entering (1); unlocking the
    // other door fully unlocks it (2) — a door alone isn't "fully".
    // (Resolving a trigger can carry the turn on: back to a main phase.)
    toStep(game, "precombat-main");
    const room = toHand(game, "Unholy Annex // Ritual Chamber");
    game.dispatch({ type: "cast-spell", player: A, card: room, face: 1, targets: [] });
    settle(game);
    expect(counters(game, bears)).toBe(2);
    toStep(game, "precombat-main");
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(counters(game, bears)).toBe(3);
  });
});

describe("Under the Skin", () => {
  it("manifests dread, then may return a permanent card — the one just milled included", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const giant = toLibrary(game, "Hill Giant");
    const pacifism = toLibrary(game, "Pacifism");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const answers: (readonly ObjectId[])[] = [[giant], [pacifism]];
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, cards) => {
      offered = cards;
      return answers.shift() ?? [];
    };
    cast(game, toHand(game, "Under the Skin"));
    expect(game.state.objects[giant].faceDown).toBeDefined();
    expect(offered).toContain(pacifism);
    expect(offered).not.toContain(bolt);
    expect(zone(game, pacifism)).toBe("hand");
  });
});

describe("Shroudstomper", () => {
  it("drains 2, gains 2 and draws on entering and on attacking", () => {
    const { game, a } = table({ players: 3 });
    const before = hand(game).length;
    const stomper = enter(game, "Shroudstomper");
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([22, 18, 18]);
    expect(hand(game).length).toBe(before + 1);
    attack(game, a, [stomper]);
    expect(life(game, A)).toBe(24);
    expect(life(game, C)).toBe(16);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Dreamdew Entrancer", () => {
  it("taps and stuns up to one creature, drawing two only if you control it", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Hill Giant", B);
    const before = hand(game).length;
    pickTargets(a, theirs);
    enter(game, "Dreamdew Entrancer");
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(3);
    expect(hand(game).length).toBe(before);

    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickTargets(a, mine);
    enter(game, "Dreamdew Entrancer");
    expect(counters(game, mine, "stun")).toBe(3);
    expect(hand(game).length).toBe(before + 2);

    pickTargets(a, null);
    enter(game, "Dreamdew Entrancer");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Hearthborn Battler", () => {
  it("deals 2 to target opponent on a player's second spell, counting spells cast before it arrived", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    spawn(game, "Hearthborn Battler");
    expect(life(game, B)).toBe(17);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(9);
  });
});

describe("Repel Calamity", () => {
  it("reaches a creature with power or toughness 4 or greater, and not a 3/3", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const wall = spawn(game, "Angelic Wall", B);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const giant = spawn(game, "Hill Giant", B);
    const repel = toHand(game, "Repel Calamity");
    expect(() => cast(game, repel, { targets: [ref(giant)] })).toThrow();
    cast(game, repel, { targets: [ref(wall)] });
    expect(zone(game, wall)).toBe("graveyard");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Repel Calamity"), { targets: [ref(dreadmaw)] });
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Hazel's Nocturne", () => {
  it("drains with no target chosen, and returns up to two creature cards", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    cast(game, toHand(game, "Hazel's Nocturne"), { targets: [null, null] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "Hazel's Nocturne"), { targets: [ref(bears), ref(giant)] });
    expect([zone(game, bears), zone(game, giant)]).toEqual(["hand", "hand"]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Pearl of Wisdom", () => {
  it("costs {1} less while you control an Otter", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const pearl = toHand(game, "Pearl of Wisdom");
    expect(canCast(game, pearl)).toBe(false);
    spawn(game, "Coruscation Mage", B);
    expect(canCast(game, pearl)).toBe(false);
    spawn(game, "Coruscation Mage");
    const before = hand(game).length;
    cast(game, pearl);
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Dewdrop Cure", () => {
  it("returns up to two small creature cards, or three with the gift promised (the opponent draws first)", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Raging Goblin"), toGraveyard(game, "Llanowar Elves")];
    const giant = toGraveyard(game, "Hill Giant");
    const cure = toHand(game, "Dewdrop Cure");
    // A three-drop is never a legal target.
    expect(() => cast(game, cure, { targets: [ref(giant), null] })).toThrow();
    cast(game, cure, { targets: [ref(cards[0]), ref(cards[1])] });
    expect(cards.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield", "graveyard"]);

    const more = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Raging Goblin")];
    const bHand = hand(game, B).length;
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: toHand(game, "Dewdrop Cure"),
      targets: [ref(cards[2]), ref(more[0]), ref(more[1])],
      kicked: true,
    });
    settle(game);
    expect([cards[2], ...more].map((id) => zone(game, id))).toEqual(["battlefield", "battlefield", "battlefield"]);
    expect(hand(game, B).length).toBe(bHand + 1);
  });
});

describe("Mistbreath Elder", () => {
  it("returns another creature you control and grows; alone, it may return itself", () => {
    const { game, a } = table({ step: "upkeep" });
    toStep(game, "precombat-main");
    const elder = spawn(game, "Mistbreath Elder");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const seen = pickPermanents(a, bears);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, elder)).toBe(1);

    // Alone: decline, and it stays without a counter; then accept.
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, elder)).toBe("battlefield");
    expect(counters(game, elder)).toBe(1);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, elder)).toBe("hand");
  });
});

describe("Flesh Burrower", () => {
  it("gives another creature you control deathtouch as it attacks", () => {
    const { game, a } = table();
    const burrower = spawn(game, "Flesh Burrower");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const seen = watchTargets(a, () => [bears]);
    a.declareAttackersFn = () => [{ attacker: burrower, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, giant).has("deathtouch")).toBe(false);
  });
});
