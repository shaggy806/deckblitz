/**
 * "Exile the top N cards of your library. You may cast a [kind] spell from
 * among them. Then put the rest on the bottom of your library in a random
 * order" with every cost paid (rule 608.2g; Sanwell, Avenger Ace's second
 * ruling): `exile-from-library`, `cast-now from: "exiled-this-way"` without
 * `free`, then `move-exiled-this-way to: "library-bottom"`. And Sanwell's
 * "as long as an artifact creature you control is attacking, prevent all
 * damage that would be dealt to Sanwell" — a conditional static prevention
 * that sees Sanwell itself (`countsSelf`; the first ruling).
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, lands, ref, spawn, table, toLibrary, toStep, zone } from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** The seat casts `card` if it's offered, else declines; records each offer. */
function castIfOffered(seat: ScriptedController, card: ObjectId | null) {
  const seen = { offered: [] as (readonly ObjectId[])[], free: [] as boolean[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    seen.free.push(offer.free === true);
    if (card === null || !offer.cards.includes(card)) return null;
    const way = offer.casts.find((c) => c.card === card)!;
    return { type: "cast-spell", player: seat.playerId, card, targets: [], via: way.via };
  };
  return seen;
}

/** `source` deals `amount` noncombat damage to `to`. */
const hit = (game: Game, source: ObjectId, to: ObjectId, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [ref(to)], { source });

describe("Sanwell, Avenger Ace", () => {
  it("becoming tapped exiles six; a Vehicle or artifact creature among them may be cast, paid for; the rest go under", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 2);
    const sanwell = spawn(game, "Sanwell, Avenger Ace");
    const bears = toLibrary(game, "Grizzly Bears");
    const sable = toLibrary(game, "Bronze Sable");
    const copter = toLibrary(game, "Smuggler's Copter");
    const six = library(game).slice(0, 6);
    const seventh = library(game)[6];
    const seen = castIfOffered(a, sable);
    attack(game, a, [sanwell]);
    // Only the artifact creature and the Vehicle are offered, and not free.
    expect([...seen.offered[0]].sort()).toEqual([sable, copter].sort());
    expect(seen.free[0]).toBe(false);
    expect(zone(game, sable)).toBe("battlefield");
    // Its {2} was paid.
    expect(plains.every((land) => game.state.objects[land].tapped)).toBe(true);
    // The other five — the Bears and the Copter not cast among them — under,
    // the seventh card now on top.
    const rest = six.filter((id) => id !== sable);
    for (const id of rest) expect(zone(game, id)).toBe("library");
    expect(zone(game, bears)).toBe("library");
    expect(library(game)[0]).toBe(seventh);
    expect(library(game).slice(-5)).toEqual(expect.arrayContaining(rest));
    expect(game.state.zones.shared.exile.length).toBe(0);
  });

  it("with no mana to pay, nothing is offered and all six go under", () => {
    const { game, a } = table();
    const sanwell = spawn(game, "Sanwell, Avenger Ace");
    toLibrary(game, "Bronze Sable");
    const six = library(game).slice(0, 6);
    const seen = castIfOffered(a, null);
    attack(game, a, [sanwell]);
    expect(seen.offered.length).toBe(0);
    for (const id of six) expect(zone(game, id)).toBe("library");
    expect(library(game).slice(-6)).toEqual(expect.arrayContaining(six));
  });

  it("damage to it is prevented while an artifact creature its controller controls attacks", () => {
    const { game, a } = table();
    const sanwell = spawn(game, "Sanwell, Avenger Ace");
    const sable = spawn(game, "Bronze Sable");
    const shocker = spawn(game, "Grizzly Bears", B);
    castIfOffered(a, null);
    a.declareAttackersFn = () => [{ attacker: sable, defender: B }];
    toStep(game, "declare-blockers");
    hit(game, shocker, sanwell, 2);
    expect(game.state.objects[sanwell].damageMarked).toBe(0);
  });

  it("…and not when only a nonartifact creature attacks", () => {
    const { game, a } = table();
    const sanwell = spawn(game, "Sanwell, Avenger Ace");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Bronze Sable");
    const shocker = spawn(game, "Grizzly Bears", B);
    castIfOffered(a, null);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    hit(game, shocker, sanwell, 2);
    expect(game.state.objects[sanwell].damageMarked).toBe(2);
  });
});
