/**
 * "Destroy all other creatures" and its kin — `destroy-all`'s `exceptSource`:
 * the effect's source is left out, whatever the filter says of it.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, B, cast, enter, graveyard, lands, ref, settle, spawn, table, toHand } from "./harness.js";

const onBattlefield = (game: Game, id: ObjectId): boolean => game.state.zones.shared.battlefield.includes(id);
const resolveAll = settle;

describe("destroy-all: exceptSource", () => {
  it("Novablast Wurm attacks: every other creature dies, its own side's too, and it stays", () => {
    const { game } = table();
    const wurm = spawn(game, "Novablast Wurm");
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", A);
    game.advanceUntil((s) => s.turn.step === "declare-attackers");
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: wurm, defender: B }] });
    resolveAll(game);
    expect(onBattlefield(game, wurm)).toBe(true);
    expect(onBattlefield(game, mine)).toBe(false);
    expect(onBattlefield(game, theirs)).toBe(false);
    expect(onBattlefield(game, land)).toBe(true);
  });

  it("two Novablast Wurms: each leaves only itself, so the first trigger to resolve kills the other", () => {
    const { game } = table();
    const first = spawn(game, "Novablast Wurm");
    const second = spawn(game, "Novablast Wurm");
    game.advanceUntil((s) => s.turn.step === "declare-attackers");
    game.dispatch({
      type: "declare-attackers",
      player: A,
      attackers: [
        { attacker: first, defender: B },
        { attacker: second, defender: B },
      ],
    });
    resolveAll(game);
    expect([onBattlefield(game, first), onBattlefield(game, second)].filter(Boolean)).toHaveLength(0);
  });

  it("Tranquil Grove: other enchantments go, on both sides, and it stays", () => {
    const { game } = table();
    const grove = spawn(game, "Tranquil Grove");
    const other = spawn(game, "Tranquil Grove", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    activate(game, grove);
    resolveAll(game);
    expect(onBattlefield(game, grove)).toBe(true);
    expect(onBattlefield(game, other)).toBe(false);
    expect(onBattlefield(game, bears)).toBe(true);
  });

  it("Mageta the Lion: the discards paid, others destroyed and not regenerated (rule 701.15c)", () => {
    const { game } = table();
    const mageta = spawn(game, "Mageta the Lion");
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].regenerationShields = 1;
    lands(game, "Plains", 4);
    const a = toHand(game, "Forest");
    const b = toHand(game, "Plains");
    activate(game, mageta, 0, { settle: false });
    if (game.state.awaiting?.kind === "discard") game.dispatch({ type: "discard", player: A, cards: [a, b] });
    resolveAll(game);
    expect(graveyard(game, A)).toEqual(expect.arrayContaining([a, b]));
    expect(onBattlefield(game, mageta)).toBe(true);
    expect(onBattlefield(game, bears)).toBe(false);
  });

  it("Worldslayer: its combat trigger destroys all permanents, lands too, and only the Equipment stays", () => {
    const { game } = table();
    const slayer = spawn(game, "Worldslayer");
    const bearer = spawn(game, "Grizzly Bears");
    const land = spawn(game, "Forest", B);
    lands(game, "Mountain", 5);
    activate(game, slayer, 0, { targets: [ref(bearer)] });
    expect(game.state.objects[slayer].attachedTo).toBe(bearer);
    game.advanceUntil((s) => s.turn.step === "declare-attackers");
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: bearer, defender: B }] });
    game.advanceUntil((s) => s.turn.step === "combat-damage" && s.zones.shared.stack.length > 0);
    resolveAll(game);
    expect(onBattlefield(game, slayer)).toBe(true);
    expect(onBattlefield(game, bearer)).toBe(false);
    expect(onBattlefield(game, land)).toBe(false);
  });

  it("Elspeth Tirel's −5: not herself, lands or tokens", () => {
    const { game } = table();
    const elspeth = spawn(game, "Elspeth Tirel");
    game.state.objects[elspeth].counters.loyalty = 5;
    const land = spawn(game, "Forest", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const relic = spawn(game, "Sol Ring", A);
    const soldier = spawn(game, "Soldier Token", B);
    game.state.objects[soldier].isToken = true;
    activate(game, elspeth, 2);
    resolveAll(game);
    expect(onBattlefield(game, land)).toBe(true);
    expect(onBattlefield(game, soldier)).toBe(true);
    expect(onBattlefield(game, bears)).toBe(false);
    expect(onBattlefield(game, relic)).toBe(false);
    // Down to 0 by her own cost she goes as a state-based action, not by this.
    expect(graveyard(game, A)).toContain(elspeth);
  });

  it("Elspeth Tirel with loyalty left stays, and her others work", () => {
    const { game } = table();
    const elspeth = spawn(game, "Elspeth Tirel");
    game.state.objects[elspeth].counters.loyalty = 7;
    const bears = spawn(game, "Grizzly Bears", A);
    activate(game, elspeth, 2);
    resolveAll(game);
    expect(onBattlefield(game, elspeth)).toBe(true);
    expect(game.state.objects[elspeth].counters.loyalty).toBe(2);
    expect(onBattlefield(game, bears)).toBe(false);

    const again = table();
    const walker = spawn(again.game, "Elspeth Tirel");
    spawn(again.game, "Grizzly Bears", A);
    spawn(again.game, "Grizzly Bears", B);
    activate(again.game, walker, 0);
    resolveAll(again.game);
    expect(again.game.state.players[A].life).toBe(21);
    const third = table();
    const three = spawn(third.game, "Elspeth Tirel");
    activate(third.game, three, 1);
    resolveAll(third.game);
    expect(third.game.state.zones.shared.battlefield.filter((id) => third.game.state.objects[id].cardName === "Soldier Token").length).toBeGreaterThan(0);
  });

  it("Desolation Giant: your own others unkicked, every other creature kicked", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const giant = enter(game, "Desolation Giant");
    expect(onBattlefield(game, giant)).toBe(true);
    expect(onBattlefield(game, mine)).toBe(false);
    expect(onBattlefield(game, theirs)).toBe(true);

    const kicked = table();
    const yours = spawn(kicked.game, "Grizzly Bears", A);
    const others = spawn(kicked.game, "Grizzly Bears", B);
    lands(kicked.game, "Mountain", 4);
    lands(kicked.game, "Plains", 2);
    const big = toHand(kicked.game, "Desolation Giant");
    cast(kicked.game, big, { kicked: true });
    expect(onBattlefield(kicked.game, big)).toBe(true);
    expect(onBattlefield(kicked.game, yours)).toBe(false);
    expect(onBattlefield(kicked.game, others)).toBe(false);
  });

  it("one token of a stack is the source: the rest of the stack goes", () => {
    const { game } = table();
    const grove = spawn(game, "Tranquil Grove");
    game.state.objects[grove].isToken = true;
    game.state.objects[grove].stackCount = 3;
    lands(game, "Forest", 3);
    activate(game, grove);
    resolveAll(game);
    const left = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Tranquil Grove");
    expect(left).toHaveLength(1);
    expect(game.state.objects[left[0]].stackCount ?? 1).toBe(1);
  });
});
