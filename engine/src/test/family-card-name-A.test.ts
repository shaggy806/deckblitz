import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = B): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

describe("choose-card-name family, group A", () => {
  it("Academic Probation's first mode stops opponents casting the name until its caster's next turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    a.chooseCardNameFn = (_v, _s, options) => {
      expect(options).not.toContain("Forest");
      return "Lightning Bolt";
    };
    cast(game, toHand(game, "Academic Probation"), { modes: [0] });
    const bolt = toHand(game, "Lightning Bolt", B);
    const own = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1, B);
    lands(game, "Mountain", 1);
    expect(canCast(game, own, A)).toBe(true);
    nextTurn(game);
    expect(game.state.turn.activePlayerIndex).toBe(1);
    expect(canCast(game, bolt)).toBe(false);
    nextTurn(game);
    nextTurn(game);
    expect(canCast(game, bolt)).toBe(true);
  });

  it("Academic Probation's second mode detains a nonland permanent", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    cast(game, toHand(game, "Academic Probation"), { modes: [1], targets: [ref(sorcerer)] });
    nextTurn(game);
    const ping = { type: "activate-ability", player: B, source: sorcerer, abilityIndex: 0, targets: [{ kind: "player", player: A }] } as const;
    expect(game.canDispatch(ping)).not.toBeNull();
  });

  it("Anointed Peacekeeper taxes the named spell for opponents and the named source's non-mana abilities", () => {
    const { game, a } = table();
    toHand(game, "Prodigal Sorcerer", B);
    lands(game, "Plains", 3);
    a.chooseCardNameFn = () => "Prodigal Sorcerer";
    cast(game, toHand(game, "Anointed Peacekeeper"));
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    const card = toHand(game, "Prodigal Sorcerer", B);
    expect(game.viewFor(B).objects[card]?.effectiveManaCost).toBe("{4}{U}");
    game.state.priority.holder = B;
    const ping = { type: "activate-ability", player: B, source: sorcerer, abilityIndex: 0, targets: [{ kind: "player", player: A }] } as const;
    expect(game.canDispatch(ping)).not.toBeNull();
    lands(game, "Wastes", 2, B);
    expect(game.canDispatch(ping)).toBeNull();
  });

  it("Comply, cast with aftermath, stops opponents casting the name until its caster's next turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    a.chooseCardNameFn = () => "Shock";
    const card = toGraveyard(game, "Failure // Comply");
    cast(game, card, { face: 2, via: "aftermath" });
    expect(zone(game, card)).toBe("exile");
    const shock = toHand(game, "Shock", B);
    lands(game, "Mountain", 1, B);
    nextTurn(game);
    expect(canCast(game, shock)).toBe(false);
  });

  it("Council of the Absolute makes the named spell {2} cheaper for its controller only", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    a.chooseCardNameFn = (_v, _s, options) => {
      expect(options).not.toContain("Grizzly Bears");
      return "Divination";
    };
    cast(game, toHand(game, "Council of the Absolute"));
    const own = toHand(game, "Divination");
    expect(game.viewFor(A).objects[own]?.effectiveManaCost).toBe("{U}");
    const theirs = toHand(game, "Divination", B);
    lands(game, "Island", 3, B);
    game.state.priority.holder = B;
    expect(canCast(game, theirs)).toBe(false);
  });

  it("Day of the Moon goads every creature with any name chosen for it, its controller's too", () => {
    const { game, a } = table();
    const names = ["Grizzly Bears", "Hill Giant"];
    a.chooseCardNameFn = (_v, _s, options) => {
      expect(options).not.toContain("Lightning Bolt");
      return names.shift() ?? "Grizzly Bears";
    };
    const theirBears = spawn(game, "Grizzly Bears", B);
    const myBears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 3);
    const saga = toHand(game, "Day of the Moon");
    cast(game, saga);
    expect(game.state.objects[theirBears].goadedBy).toEqual([A]);
    expect(game.state.objects[myBears].goadedBy).toEqual([A]);
    expect(game.state.objects[giant].goadedBy).toBeUndefined();
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(game.state.objects[saga].chosenNames).toEqual(["Grizzly Bears", "Hill Giant"]);
    expect(game.state.objects[giant].goadedBy).toEqual([A]);
    expect(game.state.objects[theirBears].goadedBy).toEqual([A]);
  });

  it("Declaration of Naught counters only a spell with the chosen name", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    a.chooseCardNameFn = () => "Lightning Bolt";
    const decl = toHand(game, "Declaration of Naught");
    cast(game, decl);
    lands(game, "Mountain", 2, B);
    game.state.priority.holder = B;
    const shock = toHand(game, "Shock", B);
    cast(game, shock, { player: B, targets: [ref(A)], settle: false });
    game.state.priority.holder = A;
    const counterShock = { type: "activate-ability", player: A, source: decl, abilityIndex: 0, targets: [ref(shock)] } as const;
    expect(game.canDispatch(counterShock)).not.toBeNull();
    settle(game);
    game.state.priority.holder = B;
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.state.priority.holder = A;
    const before = life(game, A);
    activate(game, decl, 0, { targets: [ref(bolt)] });
    expect(graveyard(game, B)).toContain(bolt);
    expect(life(game, A)).toBe(before);
  });

  it("Gideon's Intervention prevents the named source's damage to its controller and their permanents", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    a.chooseCardNameFn = () => "Prodigal Sorcerer";
    cast(game, toHand(game, "Gideon's Intervention"));
    const bears = spawn(game, "Grizzly Bears");
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    game.state.priority.holder = B;
    activate(game, sorcerer, 0, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    game.state.objects[sorcerer].tapped = false;
    game.state.priority.holder = B;
    activate(game, sorcerer, 0, { player: B, targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(0);
    const card = toHand(game, "Prodigal Sorcerer", B);
    game.state.priority.holder = B;
    expect(canCast(game, card)).toBe(false);
  });

  it("Silverquill Silencer drains the opponent who casts the named spell, and draws", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    a.chooseCardNameFn = () => "Shock";
    cast(game, toHand(game, "Silverquill Silencer"));
    const before = hand(game, A).length;
    lands(game, "Mountain", 1, B);
    game.state.priority.holder = B;
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(18);
    expect(hand(game, A).length).toBe(before + 1);
  });
});
