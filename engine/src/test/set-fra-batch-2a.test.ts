/**
 * Reality Fracture (FRA), batch 2, part a (2026-10-11): the set's next cards by EDHREC rank.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  counters,
  enter,
  hand,
  keywords,
  lands,
  named,
  pickModes,
  pickTargets,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
} from "./harness.js";

const jaceToken = (game: Game, player = A): ObjectId => {
  const [jace] = named(game, "Jace Token", player);
  if (jace === undefined) throw new Error(`${player} has no Jace token`);
  return jace;
};

const draw = (game: Game, amount: number, player = A): void => {
  game.debugApplyEffect(player, { kind: "draw", amount }, []);
  settle(game);
};

describe("Curse-Marred Demon", () => {
  it("tutors a card to hand, then discards a card at random", () => {
    const { game, a } = table();
    const wanted = game.debugSpawn("Lightning Bolt", A, "library");
    toHand(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(wanted) ? [wanted] : []);
    const before = hand(game).length;
    enter(game, "Curse-Marred Demon");
    // +1 from the search, −1 at random: the hand is the same size, one card in the graveyard.
    expect(hand(game)).toHaveLength(before);
    expect(game.state.zones.perPlayer[A].graveyard).toHaveLength(1);
    expect(game.state.objects[wanted].zone).not.toBe("library");
  });
});

describe("Way of the Healer", () => {
  it("empowers Jace 5, and planeswalkers you control have −2: create Cadet, surveil 1", () => {
    const { game } = table();
    enter(game, "Way of the Healer");
    const jace = jaceToken(game);
    expect(counters(game, jace, "loyalty")).toBe(5);
    toStep(game, "postcombat-main");
    // The Jace token's two printed abilities come first; the granted one is third.
    activate(game, jace, 2);
    expect(counters(game, jace, "loyalty")).toBe(3);
    expect(tokensNamed(game, "Cadet", A)).toBe(1);
  });
});

describe("Guiding Hydra", () => {
  it("moves a +1/+1 counter from itself to each other creature you control at your beginning of combat", () => {
    const { game, a } = table();
    const hydra = spawn(game, "Guiding Hydra");
    game.state.objects[hydra].counters["+1/+1"] = 3;
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, hydra)).toBe(2);
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });

  it("can't give the others counters when it has none to remove (if you do)", () => {
    const { game, a } = table();
    spawn(game, "Glorious Anthem"); // keeps the 1/0 alive with no counters
    const hydra = spawn(game, "Guiding Hydra");
    const bear = spawn(game, "Grizzly Bears");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toStep(game, "begin-combat");
    settle(game);
    expect(asked).toBe(0);
    expect(counters(game, hydra)).toBe(0);
    expect(counters(game, bear)).toBe(0);
  });

  it("does nothing when you decline", () => {
    const { game, a } = table();
    const hydra = spawn(game, "Guiding Hydra");
    game.state.objects[hydra].counters["+1/+1"] = 2;
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, hydra)).toBe(2);
    expect(counters(game, bear)).toBe(0);
  });
});

describe("Lyra, Tolarian Archangel", () => {
  it("makes a 3/3 flying Angel at an end step only if you drew three or more cards this turn", () => {
    const { game } = table();
    spawn(game, "Lyra, Tolarian Archangel");
    // The table's turn 1 has had its draw step: one card already.
    draw(game, 1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "3/3 Angel Token", A)).toBe(0);

    const second = table();
    spawn(second.game, "Lyra, Tolarian Archangel");
    draw(second.game, 2);
    toStep(second.game, "end");
    settle(second.game);
    expect(tokensNamed(second.game, "3/3 Angel Token", A)).toBe(1);
    const [angel] = named(second.game, "3/3 Angel Token", A);
    expect(keywords(second.game, angel).has("flying")).toBe(true);
  });

  it("counts your draws on an opponent's end step too", () => {
    const { game } = table();
    spawn(game, "Lyra, Tolarian Archangel");
    toStep(game, "precombat-main", B);
    draw(game, 3, A);
    toStep(game, "end", B);
    settle(game);
    expect(tokensNamed(game, "3/3 Angel Token", A)).toBe(1);
  });

  it("{3}{U}{U}: draws two whenever Lyra deals combat damage to a player this turn", () => {
    const { game, a } = table();
    const lyra = spawn(game, "Lyra, Tolarian Archangel");
    lands(game, "Island", 5);
    activate(game, lyra, 0);
    const before = hand(game).length;
    attack(game, a, [lyra]);
    expect(hand(game)).toHaveLength(before + 2);
  });
});

describe("Tenured Tethermage", () => {
  it("sacrifices a land for two tapped Heartwoods, then taps two artifacts for two +1/+1 counters", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    pickModes(a, 0);
    const mage = enter(game, "Tenured Tethermage");
    expect(game.state.objects[forest].zone).toBe("graveyard");
    const woods = named(game, "Heartwood Token", A);
    expect(woods).toHaveLength(2);
    expect(woods.every((id) => game.state.objects[id].tapped)).toBe(true);

    for (const id of woods) game.state.objects[id].tapped = false;
    activate(game, mage, 0);
    expect(counters(game, mage)).toBe(2);
    expect(woods.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("makes no Heartwoods without a land to sacrifice", () => {
    const { game, a } = table();
    pickModes(a, 0);
    enter(game, "Tenured Tethermage");
    expect(named(game, "Heartwood Token", A)).toHaveLength(0);
  });
});

describe("Jiang Yanggu, Never Alone", () => {
  it("creates Mowu, and untaps only your tokens at your end step", () => {
    const { game } = table();
    enter(game, "Jiang Yanggu, Never Alone");
    const [mowu] = named(game, "Mowu", A);
    expect(mowu).toBeDefined();
    expect(game.registry.get("Mowu").supertypes).toContain("legendary");
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Soldier Token", B, { tapped: true });
    game.state.objects[mowu].tapped = true;
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[mowu].tapped).toBe(false);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Transformative Commons", () => {
  it("enters tapped unless you control a planeswalker", () => {
    const { game } = table();
    const first = toHand(game, "Transformative Commons");
    game.dispatch({ type: "play-land", player: A, card: first });
    expect(game.state.objects[first].tapped).toBe(true);
    spawn(game, "Jace Beleren");
    const second = toHand(game, "Formidable Commons");
    game.dispatch({ type: "play-land", player: A, card: second });
    expect(game.state.objects[second].tapped).toBe(false);
  });
});

describe("Avatar of Burgeoning Echoes", () => {
  it("empowers Jace 2 on landfall, and gives planeswalkers −10: a +1/+1 counter per land you control", () => {
    const { game } = table();
    spawn(game, "Avatar of Burgeoning Echoes");
    enter(game, "Forest");
    const jace = jaceToken(game);
    expect(counters(game, jace, "loyalty")).toBe(2);
    lands(game, "Forest", 3); // four lands now; the opponent's don't count
    lands(game, "Forest", 2, B);
    game.state.objects[jace].counters.loyalty = 10;
    const bear = spawn(game, "Grizzly Bears");
    toStep(game, "postcombat-main");
    activate(game, jace, 2, { targets: [{ kind: "object", object: bear }] });
    expect(counters(game, bear)).toBe(4);
    // Down to 0 loyalty, the token is gone.
    expect(game.state.objects[jace]?.zone).not.toBe("battlefield");
  });
});

describe("Teyo, Lightshield Expert", () => {
  it("gives a creature hexproof and a +1/+1 counter", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    enter(game, "Teyo, Lightshield Expert");
    expect(keywords(game, bear).has("hexproof")).toBe(true);
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, bear, "loyalty")).toBe(0);
  });

  it("gives a planeswalker hexproof and a loyalty counter, and no +1/+1 counter", () => {
    const { game, a } = table();
    const jace = spawn(game, "Jace Beleren");
    const before = counters(game, jace, "loyalty");
    pickTargets(a, jace);
    enter(game, "Teyo, Lightshield Expert");
    expect(keywords(game, jace).has("hexproof")).toBe(true);
    expect(counters(game, jace, "loyalty")).toBe(before + 1);
    expect(counters(game, jace)).toBe(0);
  });
});
