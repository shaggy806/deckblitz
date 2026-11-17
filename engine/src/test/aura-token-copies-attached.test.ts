/**
 * Three Dog, Galaxy News DJ: "you may pay {2} and sacrifice an Aura attached to
 * Three Dog. When you sacrifice an Aura this way, for each other attacking
 * creature you control, create a token that's a copy of that Aura attached to
 * that creature." The reflexive trigger (rule 603.12) remembers the sacrificed
 * Aura out of a set of permanents (`SetMember.permanent`), so the copies are of
 * it as it last existed (rule 608.2h), each created attached without
 * targeting (an Aura copy that can't enchant its creature isn't made).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, graveyard, lands, pickModes, ref, settle, spawn, table } from "./harness.js";

const attachTo = (game: Game, attachment: ObjectId, host: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(host), ref(attachment)]);
  settle(game);
};
const tokenCopies = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken === true && game.state.objects[id].cardName === name);
const hostsOf = (game: Game, ids: readonly ObjectId[]): (ObjectId | null | undefined)[] =>
  ids.map((id) => game.state.objects[id].attachedTo);

function board() {
  const t = table();
  const { game } = t;
  lands(game, "Mountain", 2);
  const dog = spawn(game, "Three Dog, Galaxy News DJ");
  const aura = spawn(game, "Holy Strength");
  attachTo(game, aura, dog);
  const bears = spawn(game, "Grizzly Bears");
  const elves = spawn(game, "Llanowar Elves");
  return { ...t, dog, aura, bears, elves };
}

describe("Three Dog, Galaxy News DJ", () => {
  it("sacrifices the Aura and attaches a token copy of it to each other attacking creature", () => {
    const { game, a, dog, aura, bears, elves } = board();
    const home = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [dog, bears, elves]);
    expect(graveyard(game, A)).toContain(aura);
    const copies = tokenCopies(game, "Holy Strength");
    expect(copies).toHaveLength(2);
    expect(hostsOf(game, copies).sort()).toEqual([bears, elves].sort());
    expect(copies.every((id) => game.state.objects[id].controller === A)).toBe(true);
    // Not on Three Dog, nor on a creature that didn't attack.
    expect(hostsOf(game, copies)).not.toContain(dog);
    expect(hostsOf(game, copies)).not.toContain(home);
  });

  it("does nothing when declined", () => {
    const { game, a, dog, aura, bears } = board();
    pickModes(a);
    attack(game, a, [dog, bears]);
    expect(game.state.objects[aura].attachedTo).toBe(dog);
    expect(tokenCopies(game, "Holy Strength")).toHaveLength(0);
  });

  it("works when Three Dog stays home", () => {
    const { game, a, aura, bears } = board();
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(graveyard(game, A)).toContain(aura);
    expect(hostsOf(game, tokenCopies(game, "Holy Strength"))).toEqual([bears]);
  });

  it("attaches through shroud, but makes no copy for a creature the Aura can't enchant", () => {
    const { game, a, dog } = board();
    const shrouded = spawn(game, "Argothian Enchantress");
    const warded = spawn(game, "Azorius First-Wing");
    pickModes(a, 0);
    attack(game, a, [dog, shrouded, warded]);
    expect(hostsOf(game, tokenCopies(game, "Holy Strength"))).toEqual([shrouded]);
  });

  it("copies a sacrificed token Aura as it last existed", () => {
    const { game, a, dog, aura, bears } = board();
    game.state.objects[aura].isToken = true;
    pickModes(a, 0);
    attack(game, a, [dog, bears]);
    expect(game.state.objects[aura]).toBeUndefined();
    const copies = tokenCopies(game, "Holy Strength");
    expect(hostsOf(game, copies)).toEqual([bears]);
    expect(game.state.objects[copies[0]!].controller).not.toBe(B);
  });
});
