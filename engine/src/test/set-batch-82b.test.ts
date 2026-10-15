/**
 * Set walk batch 82, part b (2026-10-15): Final Fantasy (FIN) and Final Fantasy Commander (FIC), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
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
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** `id` becomes an artifact creature until end of turn — a crewed Vehicle. */
const crewed = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [
    ref(id),
  ]);

const manaPool = (game: Game): string[] => game.state.players[A].manaPool.map((unit) => unit.type).sort();

describe("Setzer, Wandering Gambler", () => {
  it("creates The Blackjack, a legendary 3/3 flying Vehicle with crew 2, as it enters", () => {
    const { game } = table();
    enter(game, "Setzer, Wandering Gambler");
    const [blackjack] = named(game, "The Blackjack");
    expect(blackjack).toBeDefined();
    expect(game.state.objects[blackjack].isToken).toBe(true);
    expect(supertypes(game, blackjack)).toContain("legendary");
    expect(subtypes(game, blackjack)).toContain("Vehicle");
    expect(keywords(game, blackjack).has("flying")).toBe(true);
  });

  it("flips a coin when a Vehicle deals combat damage, and a won flip makes two tapped Treasures", () => {
    const outcomes: boolean[] = [];
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, a } = table({ seed });
      spawn(game, "Setzer, Wandering Gambler");
      const vehicle = spawn(game, "The Blackjack");
      crewed(game, vehicle);
      attack(game, a, [vehicle]);
      expect(life(game, B)).toBe(17);
      const flips = game.eventsOfType("coin-flipped");
      expect(flips).toHaveLength(1);
      const won = flips[0].won;
      outcomes.push(won);
      expect(tokensNamed(game, "Treasure Token", A)).toBe(won ? 2 : 0);
      for (const t of named(game, "Treasure Token", A)) expect(game.state.objects[t].tapped).toBe(true);
    }
    expect(outcomes).toContain(true);
    expect(outcomes).toContain(false);
  });

  it("doesn't flip for a non-Vehicle creature's combat damage", () => {
    const { game, a } = table();
    spawn(game, "Setzer, Wandering Gambler");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(game.eventsOfType("coin-flipped")).toHaveLength(0);
  });
});

describe("Chocobo Camp", () => {
  it("enters tapped unless you control a legendary creature", () => {
    const { game } = table();
    const first = toHand(game, "Chocobo Camp");
    game.dispatch({ type: "play-land", player: A, card: first });
    settle(game);
    expect(game.state.objects[first].tapped).toBe(true);
    spawn(game, "Isamaru, Hound of Konda");
    const second = toHand(game, "Chocobo Camp");
    game.dispatch({ type: "play-land", player: A, card: second });
    settle(game);
    expect(game.state.objects[second].tapped).toBe(false);
  });

  it("taps for {G}, and the next Bird creature spell this turn enters with a +1/+1 counter", () => {
    const { game } = table();
    spawn(game, "Isamaru, Hound of Konda");
    const camp = spawn(game, "Chocobo Camp");
    lands(game, "Forest", 3);
    game.dispatch({ type: "activate-ability", player: A, source: camp, abilityIndex: 0, targets: [] });
    expect(manaPool(game)).toEqual(["G"]);
    // A non-Bird creature doesn't use it up.
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(0);
    const birds = toHand(game, "Birds of Paradise");
    cast(game, birds);
    expect(counters(game, birds)).toBe(1);
    // Only the next one.
    const more = toHand(game, "Birds of Paradise");
    cast(game, more);
    expect(counters(game, more)).toBe(0);
  });

  it("makes a Chocobo Bird token for {2}{G}{G}", () => {
    const { game } = table();
    spawn(game, "Isamaru, Hound of Konda");
    const camp = spawn(game, "Chocobo Camp");
    lands(game, "Forest", 4);
    activate(game, camp, 1);
    expect(tokensNamed(game, "Chocobo Bird Token", A)).toBe(1);
    expect(game.state.objects[camp].tapped).toBe(true);
  });
});

describe("Amarant Coral", () => {
  it("deals the combat damage it deals an opponent to each other opponent", () => {
    const { game, a } = table({ players: 4 });
    const amarant = spawn(game, "Amarant Coral");
    attack(game, a, [amarant]);
    expect(life(game, B)).toBe(15);
    expect(life(game, C)).toBe(15);
    expect(life(game, D)).toBe(15);
    expect(life(game, A)).toBe(20);
  });

  it("must attack each combat if able", () => {
    const { game } = table();
    spawn(game, "Amarant Coral");
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(15);
  });
});

describe("Ultimecia, Temporal Threat", () => {
  it("taps all creatures your opponents control as it enters, and not yours", () => {
    const { game } = table({ players: 3 });
    const mine = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Serra Angel", C);
    enter(game, "Ultimecia, Temporal Threat");
    expect(game.state.objects[bobs].tapped).toBe(true);
    expect(game.state.objects[carols].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
  });

  it("draws a card for each creature you control that deals combat damage to a player", () => {
    const { game, a } = table();
    spawn(game, "Ultimecia, Temporal Threat");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [one, two]);
    expect(hand(game)).toHaveLength(before + 2);
  });
});

describe("Evil Reawakened", () => {
  it("returns a creature card from your graveyard with two additional +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const giant = toGraveyard(game, "Hill Giant");
    const card = toHand(game, "Evil Reawakened");
    cast(game, card, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, giant)).toBe(2);
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Dreams of Laguna", () => {
  it("surveils 1, then draws, and can be cast again with flashback", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const top = toLibrary(game, "Lightning Bolt");
    a.chooseScryFn = () => [top];
    const card = toHand(game, "Dreams of Laguna");
    const before = hand(game).length;
    cast(game, card);
    expect(zone(game, top)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before); // cast one, drew one
    expect(zone(game, card)).toBe("graveyard");
    a.chooseScryFn = () => [];
    cast(game, card, { via: "flashback" });
    expect(zone(game, card)).toBe("exile");
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Vincent's Limit Break", () => {
  it("sets the chosen base P/T and returns the creature tapped when it dies this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    const card = toHand(game, "Vincent's Limit Break");
    cast(game, card, { modes: [2], targets: [ref(bears)] });
    // Hellmasker: base 7/2, and the counter still applies on top.
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 3 });
    expect(game.state.players[A].manaPool).toHaveLength(0);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("costs {0}, {1} or {3} more by tier", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Vincent's Limit Break");
    expect(() => cast(game, card, { modes: [2], targets: [ref(bears)] })).toThrow();
    cast(game, card, { modes: [1], targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Search for Dagger", () => {
  it("digs six for a legendary creature card when your commander enters", () => {
    const { game, a } = table();
    spawn(game, "Search for Dagger");
    lands(game, "Plains", 2);
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Grizzly Bears");
    const isamaru = toLibrary(game, "Isamaru, Hound of Konda");
    const commander = toHand(game, "Savannah Lions");
    game.state.objects[commander].isCommander = true;
    const seen = pickFromZone(a, isamaru);
    cast(game, commander);
    expect(seen.offered).toEqual([isamaru]);
    expect(zone(game, isamaru)).toBe("hand");
  });

  it("digs when your commander attacks, but not for another creature", () => {
    const { game, a } = table();
    spawn(game, "Search for Dagger");
    const commander = spawn(game, "Savannah Lions");
    game.state.objects[commander].isCommander = true;
    const bears = spawn(game, "Grizzly Bears");
    const asked = pickFromZone(a);
    attack(game, a, [bears]);
    expect(asked.offered).toEqual([]);
    toStep(game, "precombat-main");
    const isamaru = toLibrary(game, "Isamaru, Hound of Konda");
    pickFromZone(a, isamaru);
    attack(game, a, [commander]);
    expect(zone(game, isamaru)).toBe("hand");
  });
});

describe("Mega Flare", () => {
  it("deals the greatest power among your creatures to up to one creature of each opponent", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 3);
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const card = toHand(game, "Mega Flare");
    cast(game, card, { targets: [ref(angel), ref(carols), null] });
    expect(game.state.objects[angel].damageMarked).toBe(3);
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, carols)).toBe("graveyard");
    expect(tokensNamed(game, "6/6 Dragon Token", A)).toBe(0);
  });

  it("kicked, makes a 6/6 Dragon first, whose power counts", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 8);
    spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const card = toHand(game, "Mega Flare");
    cast(game, card, { kicked: true, targets: [ref(angel), null, null] });
    expect(tokensNamed(game, "6/6 Dragon Token", A)).toBe(1);
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("A Realm Reborn", () => {
  it("gives your other permanents a {T} mana ability of any color", () => {
    const { game } = table();
    const realm = spawn(game, "A Realm Reborn");
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.dispatch({ type: "activate-ability", player: A, source: bears, abilityIndex: 0, targets: [], manaColors: ["U"] });
    expect(manaPool(game)).toEqual(["U"]);
    expect(game.state.objects[bears].tapped).toBe(true);
    game.dispatch({ type: "activate-ability", player: A, source: ring, abilityIndex: 1, targets: [], manaColors: ["B"] });
    expect(manaPool(game)).toEqual(["B", "U"]);
    const offered = game.legalActions(A).filter((o) => o.kind === "activate-ability");
    expect(offered.some((o) => "source" in o && o.source === realm)).toBe(false);
    expect(game.legalActions(B).some((o) => o.kind === "activate-ability" && "source" in o && o.source === theirs)).toBe(
      false,
    );
  });
});

describe("Summon: G.F. Cerberus", () => {
  it("II copies the next instant or sorcery once, III twice", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const saga = toHand(game, "Summon: G.F. Cerberus");
    cast(game, saga);
    expect(counters(game, saga, "lore")).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    // Only the next one.
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    const another = toHand(game, "Lightning Bolt");
    cast(game, another, { targets: [ref(B)] });
    expect(life(game, B)).toBe(3);
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("Dragoon's Lance", () => {
  it("makes a Hero and equips it: +1/+0, a Knight, flying only during your turn", () => {
    const { game } = table();
    const lance = enter(game, "Dragoon's Lance");
    const hero = game.state.objects[lance].attachedTo as ObjectId;
    expect(hero).toBeDefined();
    expect(pt(game, hero)).toEqual({ power: 2, toughness: 1 });
    expect(subtypes(game, hero)).toContain("Knight");
    expect(keywords(game, hero).has("flying")).toBe(true);
    nextTurn(game);
    expect(keywords(game, hero).has("flying")).toBe(false);
    expect(subtypes(game, hero)).toContain("Knight");
  });

  it("equips for {4}", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const lance = spawn(game, "Dragoon's Lance");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, lance, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Edea, Possessed Sorceress", () => {
  it("steals, untaps and hastes an opponent's creature at the beginning of combat, until end of turn", () => {
    const { game, a } = table();
    spawn(game, "Edea, Possessed Sorceress");
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, theirs);
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, theirs)).toBe(A);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(keywords(game, theirs).has("haste")).toBe(true);
    nextTurn(game);
    expect(controller(game, theirs)).toBe(B);
  });

  it("returns a creature you control but don't own that dies to its owner, and you draw", () => {
    const { game, a } = table();
    spawn(game, "Edea, Possessed Sorceress");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, theirs)).toBe(A);
    const before = hand(game).length;
    destroy(game, theirs);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(B);
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("doesn't return a creature you own", () => {
    const { game } = table();
    spawn(game, "Edea, Possessed Sorceress");
    const mine = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    destroy(game, mine);
    expect(zone(game, mine)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });
});
