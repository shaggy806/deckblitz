// What a player who has left the game owns left with them (rule 800.4a). The
// engine leaves their permanents where they were, to be seen (`Game.inGame`),
// so nothing printed on one may go on applying: every scan of the
// battlefield's static abilities reads them through `Game.ownStatics` /
// `staticsOfSource`, which have none for such a permanent. A bug report,
// 2026-11-19: a World Shaper token dealt lethal damage was exiled by Gisa,
// Glorious Resurrector two turns after Gisa's owner had lost, so it never
// died and its lands never came back.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  C,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

type G = ReturnType<typeof table>["game"];

const offered = (game: G, card: string): boolean =>
  game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === card);

/** Alice's creature is destroyed: where it went. */
const dies =
  (name: string) =>
  (game: G): unknown => {
    const id = spawn(game, name);
    destroy(game, id, C);
    return zone(game, id);
  };
/** Alice's World Shaper is destroyed: where the Forest in her graveyard is. */
const shaperDies = (game: G): unknown => {
  const shaper = spawn(game, "World Shaper");
  const forest = toGraveyard(game, "Forest");
  destroy(game, shaper, C);
  return zone(game, forest);
};
/** Whether one Mountain casts Lightning Bolt. */
const boltOffered = (game: G): unknown => {
  spawn(game, "Mountain");
  return offered(game, toHand(game, "Lightning Bolt"));
};
/** Whether Sol Ring casts Mind Stone. */
const ringOffered = (game: G): unknown => {
  spawn(game, "Sol Ring");
  return offered(game, toHand(game, "Mind Stone"));
};
/** Cards Elvish Visionary's enters trigger draws. */
const visionaryDraws = (game: G): unknown => {
  const before = hand(game).length;
  enter(game, "Elvish Visionary");
  return hand(game).length - before;
};
/** Whether Alice's spell enters tapped. */
const entersTapped =
  (name: string, land: string, lands: number) =>
  (game: G): unknown => {
    for (let i = 0; i < lands; i += 1) spawn(game, land);
    const card = toHand(game, name);
    cast(game, card);
    return game.state.objects[card].tapped === true;
  };
/** Whether Alice's land enters tapped. */
const landEntersTapped = (game: G): unknown => game.state.objects[spawn(game, "Forest")].tapped === true;
/** Damage Alice's Lightning Bolt deals Carol. */
const boltDamage = (game: G): unknown => {
  spawn(game, "Mountain");
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(C)] });
  return 20 - game.state.players[C].life;
};
const draws =
  (n: number) =>
  (game: G): unknown => {
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: n }, []);
    settle(game);
    return hand(game).length - before;
  };
const gains = (game: G): unknown => {
  game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
  settle(game);
  return game.state.players[A].life - 20;
};
const soldiers = (game: G): unknown => {
  game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
  settle(game);
  return tokensNamed(game, "Soldier Token", A);
};
const counterPut = (game: G): unknown => {
  const bears = spawn(game, "Grizzly Bears");
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
  settle(game);
  return counters(game, bears);
};
const angelFlies = (game: G): unknown => keywords(game, spawn(game, "Serra Angel")).has("flying");
/** How many of Alice's three tapped Mountains her next untap step untaps. */
const landsUntapped = (game: G): unknown => {
  const mountains = [0, 1, 2].map(() => spawn(game, "Mountain", A, { tapped: true }));
  do nextTurn(game);
  while (activePlayerOf(game.state) !== A);
  return mountains.filter((id) => game.state.objects[id].tapped !== true).length;
};

/** `card` under Bob, what Alice then sees while Bob plays, and once he's gone. */
const CASES: readonly (readonly [card: string, what: string, probe: (game: G) => unknown, playing: unknown, gone: unknown])[] = [
  ["Gisa, Glorious Resurrector", "a dying creature", dies("Grizzly Bears"), "exile", "graveyard"],
  ["Gisa, Glorious Resurrector", "World Shaper's lands", shaperDies, "graveyard", "battlefield"],
  ["Rest in Peace", "a dying creature", dies("Grizzly Bears"), "exile", "graveyard"],
  ["Leyline of the Void", "a dying creature", dies("Grizzly Bears"), "exile", "graveyard"],
  ["Anafenza, the Foremost", "a dying creature", dies("Grizzly Bears"), "exile", "graveyard"],
  ["Kalitas, Traitor of Ghet", "a dying creature", dies("Grizzly Bears"), "exile", "graveyard"],
  ["Hushbringer", "World Shaper's lands", shaperDies, "graveyard", "battlefield"],
  ["Hushbringer", "an enters trigger", visionaryDraws, 0, 1],
  ["Torpor Orb", "an enters trigger", visionaryDraws, 0, 1],
  ["Elesh Norn, Mother of Machines", "an enters trigger", visionaryDraws, 0, 1],
  ["Thalia, Guardian of Thraben", "Lightning Bolt for {R}", boltOffered, false, true],
  ["Sphere of Resistance", "Lightning Bolt for {R}", boltOffered, false, true],
  ["Thorn of Amethyst", "Lightning Bolt for {R}", boltOffered, false, true],
  ["Contamination", "Lightning Bolt for {R}", boltOffered, false, true],
  ["Null Rod", "Sol Ring's mana", ringOffered, false, true],
  ["Collector Ouphe", "Sol Ring's mana", ringOffered, false, true],
  ["Stony Silence", "Sol Ring's mana", ringOffered, false, true],
  ["Blind Obedience", "a creature entering", entersTapped("Grizzly Bears", "Forest", 2), true, false],
  ["Authority of the Consuls", "a creature entering", entersTapped("Grizzly Bears", "Forest", 2), true, false],
  ["Kismet", "a land entering", landEntersTapped, true, false],
  ["Root Maze", "a land entering", landEntersTapped, true, false],
  ["Furnace of Rath", "Lightning Bolt's damage", boltDamage, 6, 3],
  ["Dictate of the Twin Gods", "Lightning Bolt's damage", boltDamage, 6, 3],
  ["Notion Thief", "a card drawn", draws(1), 0, 1],
  // Alice has drawn for the turn already.
  ["Spirit of the Labyrinth", "two more cards drawn", draws(2), 0, 2],
  ["Rampaging Ferocidon", "life gained", gains, 0, 3],
  ["Primal Vigor", "a token made", soldiers, 2, 1],
  ["Solemnity", "a counter put", counterPut, 0, 1],
  ["Humility", "Serra Angel's flying", angelFlies, false, true],
  ["Winter Orb", "lands untapped", landsUntapped, 1, 3],
  ["Static Orb", "lands untapped", landsUntapped, 2, 3],
];

describe("a permanent whose owner has left the game (rule 800.4a)", () => {
  for (const [card, what, probe, playing, gone] of CASES) {
    it(`${card}: ${what}, while its controller plays and once they're gone`, () => {
      const first = table({ players: 3 }).game;
      spawn(first, card, B);
      expect(probe(first), "while Bob plays").toEqual(playing);
      const second = table({ players: 3 }).game;
      spawn(second, card, B);
      second.concede(B);
      expect(probe(second), "once Bob has left").toEqual(gone);
    });
  }

  it("its triggered abilities no longer trigger: nothing waits on a player who is gone", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Soul Warden", B);
    game.concede(B);
    const life = game.state.players[B].life;
    enter(game, "Grizzly Bears");
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.players[B].life).toBe(life);
  });

  it("what dies in the check its controller loses in is still exiled (rule 704.3)", () => {
    // Bob's loss and the Bears' destruction are one event: Rest in Peace was
    // there as it happened.
    const { game } = table({ players: 3 });
    spawn(game, "Rest in Peace", B);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Forest");
    const elves = toHand(game, "Llanowar Elves");
    game.debugApplyEffect(
      C,
      {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 20, target: 0 },
          { kind: "damage", amount: 2, target: 1 },
        ],
      },
      [ref(B), ref(bears)],
    );
    // The check comes once something has been done: Alice casts a spell.
    cast(game, elves);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(zone(game, bears)).toBe("exile");
    // The next creature to die isn't.
    const next = spawn(game, "Grizzly Bears");
    destroy(game, next, C);
    expect(zone(game, next)).toBe("graveyard");
  });

  it("what a losing player's static keeps at lethal damage dies in the check they lose in (rule 704.3)", () => {
    // Every condition is read before any is acted on: the Giant is 1/1 with
    // 1 damage under Bob's Elesh Norn as the check finds Bob at 0 life.
    const { game } = table({ players: 3 });
    spawn(game, "Elesh Norn, Grand Cenobite", B);
    const giant = spawn(game, "Hill Giant");
    const bobs = spawn(game, "Hill Giant", B);
    spawn(game, "Forest");
    const elves = toHand(game, "Llanowar Elves");
    game.debugApplyEffect(
      C,
      {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 20, target: 0 },
          { kind: "damage", amount: 1, target: 1 },
        ],
      },
      [ref(B), ref(giant)],
    );
    cast(game, elves);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(zone(game, giant)).toBe("graveyard");
    // What Bob owned left the game with him, where it was: nothing moves it.
    expect(zone(game, bobs)).toBe("battlefield");
  });

  it("no scan in game.ts reads a permanent's statics from the registry itself", () => {
    // `Game.ownStatics` is the one place: a scan that goes round it reads a
    // departed player's permanents as live.
    const source = readFileSync(fileURLToPath(new URL("../game.ts", import.meta.url)), "utf8").replace(/\s+/g, "");
    const direct = source.match(/this\.registry\.get\(rulesTextName\([^()]*(?:\([^()]*\))?[^()]*\)\)\.static\b/g) ?? [];
    expect(direct).toEqual([
      "this.registry.get(rulesTextName(object)).static",
      "this.registry.get(rulesTextName(source)).static",
    ]);
  });
});
