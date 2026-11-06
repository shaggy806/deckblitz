import { describe, expect, it } from "vitest";

import {
  A,
  attack,
  B,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  named,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

// Star Trek's two new mechanics (2026-11-13; no Comprehensive Rules entry
// yet, so their reminder text is the rule):
// - "Whenever you face a dilemma" — "you face a dilemma as you choose one or
//   more modes for a spell or ability" (`trigger: { on: "faces-dilemma" }`).
// - "Beam me up [cost]" — "you may cast this card from your graveyard for
//   [cost] if you also return a creature you control to its owner's hand.
//   Then exile this spell." (`flashback.returnToHand`, keyword "beam-me-up").

describe("face a dilemma", () => {
  it("triggers when you choose a modal spell's modes as you cast it", () => {
    const { game } = table();
    spawn(game, "Elim Garak, Simple Tailor");
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const charm = toHand(game, "Izzet Charm");
    cast(game, charm, { modes: [2] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("isn't yours when an opponent chooses their own spell's modes", () => {
    const { game } = table();
    spawn(game, "Elim Garak, Simple Tailor");
    spawn(game, "Melkotian Adjudicator", B);
    lands(game, "Island", 1, B);
    lands(game, "Mountain", 1, B);
    // An instant, so Bob casts it with priority passed to him.
    const charm = toHand(game, "Izzet Charm", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, charm, { player: B, modes: [2] });
    // Bob faced the dilemma: his Adjudicator grows, Alice's Garak stays quiet.
    expect(life(game, B)).toBe(20);
    expect(counters(game, named(game, "Melkotian Adjudicator", B)[0])).toBe(1);
  });

  it("isn't a 'you may' choice: Gabriel Lorca's payment doesn't face another dilemma", () => {
    const { game, a } = table();
    spawn(game, "Elim Garak, Simple Tailor");
    const lorca = toGraveyard(game, "Gabriel Lorca, Mirror Menace");
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 1);
    pickModes(a, 0); // yes, pay {B}
    const charm = toHand(game, "Izzet Charm");
    cast(game, charm, { modes: [2] });
    // One dilemma: Garak once, and Lorca back in hand for {B}.
    expect(life(game, B)).toBe(18);
    expect(zone(game, lorca)).toBe("hand");
  });

  it("Jett Reno surveils when tapped, and draws instead at power 4 or more", () => {
    for (const [extra, drew] of [
      [0, 0],
      [3, 1],
    ] as const) {
      const { game, a } = table();
      const jett = spawn(game, "Jett Reno, Problem Solver");
      if (extra > 0) game.state.objects[jett].counters = { "+1/+1": extra };
      const before = hand(game).length;
      attack(game, a, [jett]);
      expect(hand(game).length).toBe(before + drew);
    }
  });
});

describe("beam me up", () => {
  const offers = (game: ReturnType<typeof table>["game"], card: string) =>
    game
      .legalActions(A)
      .filter((x) => x.kind === "cast-spell" && game.state.objects[x.card]?.cardName === card && x.via === "flashback");

  it("casts from the graveyard by returning a creature you control, then exiles the spell", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const comms = toGraveyard(game, "Open Communications");
    const before = hand(game).length;
    cast(game, comms, { via: "flashback" });
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, comms)).toBe("exile");
    // The bear and the card drawn.
    expect(hand(game).length).toBe(before + 2);
  });

  it("isn't offered without a creature to return", () => {
    const { game } = table();
    lands(game, "Island", 3);
    toGraveyard(game, "Open Communications");
    expect(offers(game, "Open Communications")).toHaveLength(0);
    spawn(game, "Grizzly Bears");
    expect(offers(game, "Open Communications")).toHaveLength(1);
  });

  it("asks which creature when there's a choice, and returns only that one", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 6);
    const malfunction = toGraveyard(game, "Transporter Malfunction");
    a.choosePermanentsFn = () => [other];
    cast(game, malfunction, { via: "flashback", targets: [ref(B)] });
    expect(zone(game, other)).toBe("hand");
    expect(zone(game, bear)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
    expect(graveyard(game)).not.toContain(malfunction);
  });
});

describe("the feature's other cards", () => {
  it("Pure Energy splits its counters over two targets, or puts both on one", () => {
    const { game } = table();
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Pure Energy"), { targets: [ref(x), ref(y)] });
    expect([counters(game, x), counters(game, y)]).toEqual([1, 1]);
    cast(game, toHand(game, "Pure Energy"), { targets: [ref(x), null] });
    expect(counters(game, x)).toBe(3);
  });

  it("Tell Me What You See: the opponent picks your draw, or their 4 life", () => {
    for (const [choice, drew, bobLife] of [
      [0, 1, 20],
      [1, 0, 16],
    ] as const) {
      const { game, a, b } = table();
      lands(game, "Swamp", 2);
      pickTargets(a, B);
      pickModes(b, choice);
      const before = hand(game).length;
      cast(game, toHand(game, "Tell Me What You See"));
      // Counted before the enchantment was put in hand: just the draw, if
      // Bob allowed it.
      expect(hand(game).length).toBe(before + drew);
      expect(life(game, B)).toBe(bobLife);
    }
  });
});
