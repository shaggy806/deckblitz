/**
 * Reality Fracture (FRA), batch 1, part a (2026-10-11): the set's top cards by
 * EDHREC rank. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { nameOf } from "../state.js";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

type TestGame = ReturnType<typeof table>["game"];

const castable = (game: TestGame, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some((o: LegalAction) => o.kind === "cast-spell" && o.card === card);

describe("The Theorist, Jace Beleren", () => {
  it("draws you a card in each opponent's draw step, not in your own", () => {
    const { game } = table();
    spawn(game, "The Theorist, Jace Beleren");
    const before = hand(game, A).length;
    nextTurn(game); // bob's turn: his draw, then Jace's
    expect(hand(game, A).length).toBe(before + 1);
    nextTurn(game); // alice's turn: only her own draw
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("−2 returns up to one artifact or creature of each opponent's, each bound to its player", () => {
    const { game } = table({ players: 3 });
    const jace = spawn(game, "The Theorist, Jace Beleren");
    const thopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Hill Giant");
    // Carol's creature can't fill Bob's slot.
    expect(() => loyalty(game, jace, -2, { targets: [ref(bears), null, null] })).toThrow();
    loyalty(game, jace, -2, { targets: [ref(thopter), ref(bears), null] });
    expect(zone(game, thopter)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("−6 draws three, then puts counters equal to the cards in your hand on each creature you control", () => {
    const { game } = table();
    const jace = spawn(game, "The Theorist, Jace Beleren");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const before = hand(game, A).length;
    loyalty(game, jace, -6, { atLeast: 6 });
    expect(hand(game, A).length).toBe(before + 3);
    expect(counters(game, bears)).toBe(before + 3);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Liliana the Faultless", () => {
  it("gains 1 life for another creature or planeswalker entering, not a land", () => {
    const { game } = table();
    spawn(game, "Liliana the Faultless");
    enter(game, "Grizzly Bears");
    expect(life(game, A)).toBe(21);
    enter(game, "Ajani Resolute");
    expect(life(game, A)).toBe(22);
    enter(game, "Forest");
    expect(life(game, A)).toBe(22);
  });

  it("discards a card to give another creature or planeswalker hexproof, never herself", () => {
    const { game, a } = table();
    const liliana = spawn(game, "Liliana the Faultless");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    const bolt = toHand(game, "Lightning Bolt");
    expect(() => activate(game, liliana, 0, { targets: [ref(liliana)] })).toThrow();
    a.chooseDiscardsFn = () => [bolt];
    activate(game, liliana, 0, { targets: [ref(bears)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(keywords(game, bears).has("hexproof")).toBe(true);
  });
});

describe("Samut, Tyrant of Naktamun", () => {
  const setUp = (withSamut: boolean) => {
    const t = table();
    if (withSamut) spawn(t.game, "Samut, Tyrant of Naktamun");
    lands(t.game, "Island", 1);
    lands(t.game, "Forest", 2);
    lands(t.game, "Mountain", 1, B);
    return { ...t, bolt: toHand(t.game, "Lightning Bolt", B) };
  };

  it("gives your instants split second: an opponent can't respond with a spell", () => {
    const { game, bolt } = setUp(true);
    cast(game, toHand(game, "Opt"), { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    expect(castable(game, B, bolt)).toBe(false);
  });

  it("not without Samut, and not to a creature spell", () => {
    const without = setUp(false);
    cast(without.game, toHand(without.game, "Opt"), { settle: false });
    without.game.dispatch({ type: "pass-priority", player: A });
    expect(castable(without.game, B, without.bolt)).toBe(true);

    const { game, bolt } = setUp(true);
    cast(game, toHand(game, "Grizzly Bears"), { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    expect(castable(game, B, bolt)).toBe(true);
  });
});

describe("Craterclaw Colossus", () => {
  it("gives your creatures trample and +X/+0, X the artifacts you control", () => {
    const { game } = table();
    spawn(game, "Sol Ring");
    spawn(game, "Ornithopter");
    spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Craterclaw Colossus");
    // Sol Ring, Ornithopter and the Colossus itself: X = 3.
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Flickering Hound", () => {
  it("on a creature spell, flickers up to one other creature you control", () => {
    const { game, a } = table();
    const hound = spawn(game, "Flickering Hound");
    spawn(game, "Hill Giant");
    const giant = named(game, "Hill Giant", A)[0];
    game.state.objects[giant].counters["+1/+1"] = 2;
    lands(game, "Forest", 2);
    const seen = watchTargets(a, (offered) => [offered[0].find((id) => id === giant) ?? null]);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(hound);
    // It came back as a new object, its counters gone.
    const back = named(game, "Hill Giant", A);
    expect(back).toHaveLength(1);
    expect(counters(game, back[0])).toBe(0);
  });
});

describe("Hexhaven Invigorator", () => {
  it("searches for up to as many lands as the damage it was dealt, onto the battlefield tapped", () => {
    const { game, a } = table();
    const hexhaven = spawn(game, "Hexhaven Invigorator");
    const before = named(game, "Wastes", A).length;
    let offeredMax = -1;
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      offeredMax = max;
      return eligible.slice(0, max);
    };
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(hexhaven)]);
    settle(game);
    expect(offeredMax).toBe(3);
    const wastes = named(game, "Wastes", A);
    expect(wastes.length).toBe(before + 3);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Ajani Resolute", () => {
  it("gains loyalty whenever you gain life, its 0 included", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Resolute");
    const start = counters(game, ajani, "loyalty");
    loyalty(game, ajani, 0);
    expect(life(game, A)).toBe(21);
    expect(counters(game, ajani, "loyalty")).toBe(start + 1);
  });

  it("−4 makes a token named Ajani's Pridemate that grows when you gain life", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Resolute");
    loyalty(game, ajani, -4, { atLeast: 5 });
    const tokens = game.battlefield.filter((id) => game.state.objects[id].isToken);
    expect(tokens).toHaveLength(1);
    const pridemate = tokens[0];
    expect(nameOf(game.state.objects[pridemate])).toBe("Ajani's Pridemate");
    expect(pt(game, pridemate)).toEqual({ power: 2, toughness: 2 });
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(counters(game, pridemate)).toBe(1);
    expect(counters(game, ajani, "loyalty")).toBe(2);
  });
});

describe("Ghalta the Unstoppable", () => {
  it("costs {X} less, X the greatest power among your creatures (not their total)", () => {
    const { game } = table();
    spawn(game, "Craw Wurm"); // 6/4
    const bears = spawn(game, "Grizzly Bears");
    const forests = lands(game, "Forest", 3);
    cast(game, toHand(game, "Ghalta the Unstoppable"));
    expect(named(game, "Ghalta the Unstoppable", A)).toHaveLength(1);
    // {8}{G} less 6: all three Forests paid it (a total-power reduction of 8
    // would have needed only one).
    expect(forests.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Vraska, Soul of Stone", () => {
  it("makes a Sculpture Treasure for a noncreature spell, and your artifact creatures have vigilance", () => {
    const { game } = table();
    spawn(game, "Vraska, Soul of Stone");
    lands(game, "Island", 1);
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Opt"));
    expect(tokensNamed(game, "Sculpture Treasure Token", A)).toBe(1);
    const token = named(game, "Sculpture Treasure Token", A)[0];
    expect(types(game, token)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(keywords(game, token).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Sculpture Treasure Token", A)).toBe(1);
  });
});

describe("Verdant Kraken", () => {
  it("makes you a Forest Tentacle at the beginning of each player's upkeep", () => {
    const { game } = table();
    spawn(game, "Verdant Kraken");
    nextTurn(game); // bob's upkeep
    expect(tokensNamed(game, "Forest Tentacle Token", A)).toBe(1);
    expect(tokensNamed(game, "Forest Tentacle Token", B)).toBe(0);
    nextTurn(game); // alice's upkeep
    expect(tokensNamed(game, "Forest Tentacle Token", A)).toBe(2);
    const tentacle = named(game, "Forest Tentacle Token", A)[0];
    expect(types(game, tentacle)).toEqual(expect.arrayContaining(["land", "creature"]));
  });
});
