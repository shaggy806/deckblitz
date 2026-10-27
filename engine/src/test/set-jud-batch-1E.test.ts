/**
 * Judgment, group E: Grizzly Fate's threshold, Wormfang Turtle's linked
 * land, Phantom Nomad's prevention, Chastise's life, Laquatus's Disdain's
 * graveyard-cast target, Grave Consequences' per-player exile and Krosan
 * Wayfarer's optional land.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickPermanents,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const fill = (game: Game, n: number, player = A): void => {
  for (let i = 0; i < n; i += 1) toGraveyard(game, "Wastes", player);
};

describe("Grizzly Fate", () => {
  it("makes two Bears without threshold, not counting itself", () => {
    const { game } = table();
    fill(game, 6);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Grizzly Fate"));
    expect(tokensNamed(game, "Bear Token", A)).toBe(2);
  });

  it("makes four Bears with threshold, and flashback exiles it", () => {
    const { game } = table();
    fill(game, 6);
    const fate = toGraveyard(game, "Grizzly Fate");
    lands(game, "Forest", 7);
    // Cast from the graveyard: on the stack it leaves six behind, so no threshold.
    cast(game, fate, { via: "flashback" });
    expect(tokensNamed(game, "Bear Token", A)).toBe(2);
    expect(zone(game, fate)).toBe("exile");
    const { game: g2 } = table();
    fill(g2, 7);
    lands(g2, "Forest", 5);
    cast(g2, toHand(g2, "Grizzly Fate"));
    expect(tokensNamed(g2, "Bear Token", A)).toBe(4);
  });
});

describe("Wormfang Turtle", () => {
  it("exiles a land you control and returns it when it leaves", () => {
    const { game, a } = table();
    const [island, other] = lands(game, "Island", 2);
    const seen = pickPermanents(a, other);
    const turtle = enter(game, "Wormfang Turtle");
    expect(seen.offered).toContain(island);
    expect(zone(game, other)).toBe("exile");
    expect(zone(game, island)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(turtle)]);
    settle(game);
    expect(zone(game, turtle)).toBe("graveyard");
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Island");
    expect(back).toHaveLength(2);
  });
});

describe("Phantom Nomad", () => {
  it("prevents the damage and loses one counter", () => {
    const { game } = table();
    const nomad = enter(game, "Phantom Nomad");
    expect(counters(game, nomad)).toBe(2);
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(nomad)]);
    settle(game);
    expect(zone(game, nomad)).toBe("battlefield");
    expect(counters(game, nomad)).toBe(1);
    expect(game.state.objects[nomad].damageMarked).toBe(0);
  });
});

describe("Chastise", () => {
  it("destroys an attacking creature and gains life equal to its power", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 4);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && quiet(s) && s.priority.holder === A);
    cast(game, toHand(game, "Chastise"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });

  it("can't target a creature that isn't attacking", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    expect(() => cast(game, toHand(game, "Chastise"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Laquatus's Disdain", () => {
  it("counters a spell cast from a graveyard and draws", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const twice = toGraveyard(game, "Think Twice");
    cast(game, twice, { via: "flashback", settle: false });
    const before = hand(game, A).length;
    cast(game, toHand(game, "Laquatus's Disdain"), { targets: [ref(twice)] });
    expect(zone(game, twice)).toBe("exile");
    // Disdain's draw only: Think Twice was countered.
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("can't target a spell cast from hand", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const opt = toHand(game, "Think Twice");
    cast(game, opt, { settle: false });
    expect(() => cast(game, toHand(game, "Laquatus's Disdain"), { targets: [ref(opt)] })).toThrow();
  });
});

describe("Grave Consequences", () => {
  it("each player exiles what they choose, then loses life for what's left", () => {
    const { game, a, b } = table();
    fill(game, 3, A);
    fill(game, 2, B);
    const [keepA] = graveyard(game, A);
    const exileA = graveyard(game, A).filter((id) => id !== keepA);
    pickFromZone(a, ...exileA);
    pickFromZone(b, ...graveyard(game, B));
    lands(game, "Swamp", 2);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Grave Consequences"));
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
    expect(graveyard(game, B)).toHaveLength(0);
    // The draw (the spell itself came and went).
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Krosan Wayfarer", () => {
  it("sacrifices itself to put a land from hand onto the battlefield", () => {
    const { game, a } = table();
    const wayfarer = spawn(game, "Krosan Wayfarer");
    const forest = toHand(game, "Forest");
    pickFromZone(a, forest);
    activate(game, wayfarer);
    expect(zone(game, wayfarer)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
  });
});
